const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const Immutable = require('immutable');
const { black } = require('../color');
const { Block, BlockModel } = require('./block');
const { Link, LinkModel } = require('./link');
const { BlockCreator, BlockCreatorModel } = require('./block-creator');
const { Component } = React;
const { List, Map } = Immutable;

class Chain extends Component {
	constructor(props) {
		super(props);

		const windowBlock = new BlockModel({ name: 'window', x: window.innerWidth / 2, y: window.innerHeight / 2 });
		const windowBlockId = windowBlock.get('id');

		this.state = {
			blocks: Map([[windowBlockId, windowBlock]]),
			links: List(),
			tempLink: new LinkModel(),
			onConnectPinEnd: null,
			blockCreator: new BlockCreatorModel()
		};
		this.prevScript = '';
		this.windowBlockId = windowBlockId;
		this.tempBlockAndPin = null;
		this.isMouseDown = false;
		this.isConnecting = false;
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.addBlock = this.addBlock.bind(this);
		this.removeBlock = this.removeBlock.bind(this);
		this.updateBlock = this.updateBlock.bind(this);
		this.updateBlockCreator = this.updateBlockCreator.bind(this);
		this.onConnectPinStart = this.onConnectPinStart.bind(this);
		this.onConnectPinEnd = this.onConnectPinEnd.bind(this);
		this.onConnectMoveDocument = this.onConnectMoveDocument.bind(this);
		this.onConnectEndDocument = this.onConnectEndDocument.bind(this);
		window.addEventListener('message', this.onMessage.bind(this));
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { state, props } = this;

		return !Immutable.is(Map(state), Map(nextState)) || !Immutable.is(Map(props), Map(nextProps));
	}

	componentDidUpdate() {
		const { windowBlockId, props: { updateHTMLRenderer }, prevScript } = this;
		const $html = document.createElement('html');
		const $body = document.createElement('body');
		const $script = document.createElement('script');
		const script = _.join(_.map(this.block2expression(windowBlockId), (a) => `parent.postMessage({ type: 'chainResult', value: ${a} }, '*');`), '\n').replace(/\n/g, '\\n').replace(/"/g, '\\"');

		if (prevScript === script) { return; }
		this.prevScript = script;
		$script.innerHTML = `parent.postMessage({ type: 'chainClear' }, '*');\ntry{\n(0, eval)("${script}")\n}catch(e){\nparent.postMessage({type: 'chainError', value: String(e)}, '*');\n}`;
		$body.appendChild($script);
		$html.appendChild($body);
		updateHTMLRenderer($html.outerHTML);
	}

	render() {
		const {
			state: { blocks, links: _links, tempLink, blockCreator },
		} = this;
		const links = _links.map(({ output: [oBlockId, oPinIndex], input: [iBlockId, iPinIndex] }) => {
			const pintopin = _.map([[oBlockId, 'outputPins', oPinIndex], [iBlockId, 'inputPins', iPinIndex]], (key) => {
				const [id] = key;

				return blocks.get(id).absolutePositionOf(blocks.getIn(key));
			});

			return <Link pintopin={pintopin} />;
		});

		return (
			<div style={{
				width: '100%',
				height: '100%',
				position: 'relative',
				backgroundColor: black
			}}>
				<svg
					onTouchStart={this.onMouseDown}
					onTouchMove={this.onMouseMove}
					onTouchEnd={this.onMouseUp}
					onMouseDown={this.onMouseDown}
					onMouseMove={this.onMouseMove}
					onMouseUp={this.onMouseUp}
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						display: 'block'
					}}>
					{links}
					<Link model={tempLink} />
				</svg>
				<div style={{
					width: '100%',
					height: '100%',
				}}>
					{
						blocks.keySeq().map((id) => (
							<Block
								model={blocks.get(id)}
								onConnectPinStart={this.onConnectPinStart}
								onConnectPinEnd={this.onConnectPinEnd}
								update={this.updateBlock}
								remove={this.removeBlock}
							/>
						))
					}
					{<BlockCreator model={blockCreator} add={this.addBlock} update={this.updateBlockCreator} />}
				</div>
			</div>
		);
	}

	/**
	 * @param {MessageEvent} e
	 */
	onMessage(e) {
		const { state: { blocks }, props: { addBalloon }, windowBlockId } = this;
		const { data: { value, type } } = e;

		if (type === 'chainClear') {
			this.setState({
				blocks: blocks.setIn([windowBlockId, 'value'], '')
			});
		} else if (type === 'chainResult') {
			const result = _.isObjectLike(value) ? JSON.stringify(value) : String(value);

			this.setState({
				blocks: blocks.updateIn([windowBlockId, 'value'], (a) => a ? `${a}\n${result}` : result)
			});
		} else if (type === 'chainError') {
			addBalloon(value);
		}
	}

	/**
	 * @param {string} id
	 * @returns {string|string[]}
	 */
	block2expression(id) {
		const { state: { blocks } } = this;
		const block = blocks.get(id);
		const name = block.get('name');

		if (name === 'window') {
			const ret = [];

			block.get('inputPins').forEach((pin) => {
				const id = pin.get('dst');

				if (!id) { return; }
				ret.push(this.block2expression(id));
			});

			return ret;
		}

		const value = block.get('value');
		const values = block.get('inputPins').map((pin) => {
			const id = pin.get('dst');

			return id ? this.block2expression(id) : null;
		}).toJS();

		if (name === 'function') {
			const [self, ...args] = values;

			return self ? `${self}["${value}"](${_.join(args, ', ')})` : `${value}(${_.join(args, ', ')})`;
		} else if (name === 'property') {
			const [self] = values;

			return `${self}["${value}"]`;
		} else if (name === 'operator') {
			return _.join(values, value);
		} else if (name === 'debug') {
			return `_this_is_debug_block(${_.join(values, ', ')})`;
		}

		return value;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	mouse(e) {
		const { left, top } = ReactDOM.findDOMNode(this).getBoundingClientRect();

		if (_.has(e, 'touches')) {
			const { clientX, clientY } = e.changedTouches.item(0);
			const x = clientX - left;
			const y = clientY - top;

			return [x, y];
		}

		const { clientX, clientY } = e;
		const x = clientX - left;
		const y = clientY - top;

		return [x, y];
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	onMouseDown(e) {
		const { target, currentTarget } = e;

		if (target !== currentTarget) { return; }
		this.isMouseDown = true;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	onMouseMove() {
		this.isMouseDown = false;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	onMouseUp(e) {
		const { isMouseDown, state: { blockCreator } } = this;
		const [x, y] = this.mouse(e);

		if (isMouseDown) {
			this.setState({ blockCreator: blockCreator.toggle().merge({ x, y }) });
		}

		this.isMouseDown = false;
	}

	/**
	 * @param {BlockCreatorModel} model
	 */
	updateBlockCreator(model) {
		this.setState({ blockCreator: model });
	}

	/**
	 * @param {BlockModel} block
	 * @param {PinModel} pin
	 */
	onConnectPinStart(block, pin) {
		const blockId = block.get('id');
		const { state: { blocks, tempLink } } = this;
		const [x, y] = blocks.get(blockId).absolutePositionOf(pin);
		const pinIndex = pin.get('index');

		document.addEventListener('mousemove', this.onConnectMoveDocument);
		document.addEventListener('mouseup', this.onConnectEndDocument);
		this.tempBlockAndPin = [blockId, pin];
		this.isConnecting = true;

		if (pin.get('type') === 1) {
			const { blocks, links } = this.disconnectedPins({ input: [blockId, pinIndex] });

			this.setState({
				tempLink: tempLink.start(x, y),
				blocks,
				links
			});
		} else {
			this.setState({
				tempLink: tempLink.start(x, y),
			});
		}
	}

	/**
	 * @param {BlockModel} block0
	 * @param {PinModel} pin0
	 */
	onConnectPinEnd(block0, pin0) {
		const { tempBlockAndPin: [id1, pin1], isConnecting } = this;
		if (!isConnecting) { return; }

		const id0 = block0.get('id');
		const [[type0, index0], [type1, index1]] = _.map([pin0, pin1], (a) => [a.get('type'), a.get('index')]);

		if (id0 === id1 || type0 === type1) { return; }
		const [[oBlockId, oPinIndex], [iBlockId, iPinIndex]] = _.sortBy([[id0, index0, type0], [id1, index1, type1]], 2);
		const { links, blocks } = this.disconnectedPins({ input: [iBlockId, iPinIndex] });

		this.setState({
			links: links.push({ output: [oBlockId, oPinIndex], input: [iBlockId, iPinIndex] }),
			blocks: blocks.updateIn([oBlockId, 'outputPins', oPinIndex], (pin) => pin.connect()).updateIn([iBlockId, 'inputPins', iPinIndex], (pin) => pin.connect(oBlockId))
		});
	}

	/**
	 * @param {MouseEvent} e
	 */
	onConnectMoveDocument(e) {
		const { state: { tempLink } } = this;
		const [x, y] = this.mouse(e);

		this.setState({ tempLink: tempLink.end(x, y) });
	}

	onConnectEndDocument() {
		const { state: { tempLink } } = this;

		document.removeEventListener('mousemove', this.onConnectMoveDocument);
		document.removeEventListener('mouseup', this.onConnectEndDocument);
		this.isConnecting = false;
		this.setState({ tempLink: tempLink.set('visible', false) });
	}

	addBlock() {
		const { state: { blockCreator, blocks } } = this;
		const x = blockCreator.get('x');
		const y = blockCreator.get('y');
		const value = blockCreator.get('value');
		const name = blockCreator.get('name');
		const block = new BlockModel({ x, y, value, name });
		const id = block.get('id');

		this.setState({ blocks: blocks.set(id, block), blockCreator: blockCreator.hide() });
	}

	/**
	 * @param {BlockModel} model
	 * @param {boolean} shouldLinkUpdate
	 */
	updateBlock(model, shouldLinkUpdate) {
		const id = model.get('id');

		if (shouldLinkUpdate) {
			const { size } = model.get('inputPins');
			const { blocks, links } = this.disconnectedPins({ input: [id, size] });

			this.setState({
				blocks: blocks.set(id, model),
				links
			});
		} else {
			const { state: { blocks } } = this;

			this.setState({ blocks: blocks.set(id, model) });
		}
	}

	/**
	 * @param {BlockModel} model
	 */
	removeBlock(model) {
		const id = model.get('id');
		const { blocks, links } = this.disconnectedPins({ input: [id], output: [id] });

		this.setState({
			blocks: blocks.delete(id),
			links
		});
	}

	/**
	 * @param {{output: (string|number)[], input: (string|number)[]}} target
	 */
	disconnectedPins(target) {
		let { state: { blocks, links } } = this;
		const names = _.filter(['input', 'output'], (a) => _.has(target, a));

		links = links.filter((link) => {
			return _.reduce(names, (current, name) => {
				const [targetId, targetIndex] = target[name];
				const [linkId, linkIndex] = link[name];

				if (targetId === linkId && (targetIndex === undefined || targetIndex === linkIndex)) {
					const { input: [inputId, inputIndex], output: [outputId, outputIndex] } = link;

					blocks = blocks.updateIn([inputId, 'inputPins', inputIndex], (pin) => pin.disconnect()).updateIn([outputId, 'outputPins', outputIndex], (pin) => pin.disconnect()).update(inputId, (block) => {
						const name = block.get('name');

						return name === 'view' ? block.set('value', '') : block;
					});

					return false;
				}

				return current;
			}, true);
		});

		return { blocks, links };
	}
}

module.exports = { Chain };