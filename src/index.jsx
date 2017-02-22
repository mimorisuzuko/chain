const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const Immutable = require('immutable');
const {Block, BlockModel} = require('./components/block');
const {Link, LinkModel} = require('./components/link');
const {BlockCreator, BlockCreatorModel} = require('./components/block-creator');
const {Component} = React;
const {List, Map} = Immutable;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			blocks: Map(),
			links: List(),
			tempLink: new LinkModel(),
			onConnectPinEnd: null,
			blockCreator: new BlockCreatorModel()
		};
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
	}

	render() {
		const {state: {blocks, links: _links, tempLink, blockCreator}} = this;
		const links = _links.map(({output: [oBlockId, oPinIndex], input: [iBlockId, iPinIndex]}) => {
			const pintopin = _.map([[oBlockId, 'outputPins', oPinIndex], [iBlockId, 'inputPins', iPinIndex]], (key) => {
				const [id] = key;

				return blocks.get(id).absoluteCentralPositionOf(blocks.getIn(key));
			});

			return <Link pintopin={pintopin} />;
		});

		return (
			<div style={{
				width: '100%',
				height: '100%',
				position: 'relative'
			}}>
				<svg
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
	 * @param {MouseEvent} e
	 */
	mouse(e) {
		const {clientX, clientY} = e;
		const {left, top} = ReactDOM.findDOMNode(this).getBoundingClientRect();
		const x = clientX - left;
		const y = clientY - top;

		return [x, y];
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseDown(e) {
		const {target, currentTarget} = e;

		if (target !== currentTarget) { return; }
		this.isMouseDown = true;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseMove() {
		this.isMouseDown = false;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseUp(e) {
		const {isMouseDown, state: {blockCreator}} = this;
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
		const {state: {blocks, tempLink}} = this;
		const [x, y] = blocks.get(blockId).absoluteCentralPositionOf(pin);
		const pinIndex = pin.get('index');

		document.addEventListener('mousemove', this.onConnectMoveDocument);
		document.addEventListener('mouseup', this.onConnectEndDocument);
		this.tempBlockAndPin = [blockId, pin];
		this.isConnecting = true;

		if (pin.get('type') === 1) {
			const {blocks, links} = this.disconnectedPins({ input: [blockId, pinIndex] });

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
		const {tempBlockAndPin: [id1, pin1], isConnecting} = this;
		if (!isConnecting) { return; }

		const id0 = block0.get('id');
		const [[type0, index0], [type1, index1]] = _.map([pin0, pin1], (a) => [a.get('type'), a.get('index')]);

		if (id0 === id1 || type0 === type1) { return; }
		const [[oBlockId, oPinIndex], [iBlockId, iPinIndex]] = _.sortBy([[id0, index0, type0], [id1, index1, type1]], 2);
		const {links, blocks} = this.disconnectedPins({ input: [iBlockId, iPinIndex] });

		this.setState({
			links: links.push({ output: [oBlockId, oPinIndex], input: [iBlockId, iPinIndex] }),
			blocks: blocks.updateIn([oBlockId, 'outputPins', oPinIndex], (pin) => pin.connect()).updateIn([iBlockId, 'inputPins', iPinIndex], (pin) => pin.connect(oBlockId))
		});
	}

	/**
	 * @param {MouseEvent} e
	 */
	onConnectMoveDocument(e) {
		const {state: {tempLink}} = this;
		const [x, y] = this.mouse(e);

		this.setState({ tempLink: tempLink.end(x, y) });
	}

	onConnectEndDocument() {
		const {state: {tempLink}} = this;

		document.removeEventListener('mousemove', this.onConnectMoveDocument);
		document.removeEventListener('mouseup', this.onConnectEndDocument);
		this.isConnecting = false;
		this.setState({ tempLink: tempLink.set('visible', false) });
	}

	addBlock() {
		const {state: {blockCreator, blocks}} = this;
		const x = blockCreator.get('x');
		const y = blockCreator.get('y');
		const value = blockCreator.get('value');
		const name = blockCreator.get('name');
		const block = new BlockModel({ x, y, value, name });
		const id = block.get('id');

		this.setState({ blocks: blocks.set(id, block), blockCreator: blockCreator.set('visible', false) });
	}

	/**
	 * @param {BlockModel} model
	 * @param {boolean} shouldLinkUpdate
	 */
	updateBlock(model, shouldLinkUpdate) {
		const id = model.get('id');

		if (shouldLinkUpdate) {
			const {size} = model.get('inputPins');
			const {blocks, links} = this.disconnectedPins({ input: [id, size] });

			this.setState({
				blocks: blocks.set(id, model),
				links
			});
		} else {
			const {state: {blocks}} = this;

			this.setState({ blocks: blocks.set(id, model) });
		}
	}

	/**
	 * @param {BlockModel} model
	 */
	removeBlock(model) {
		const id = model.get('id');
		const {blocks, links} = this.disconnectedPins({ input: [id], output: [id] });

		this.setState({
			blocks: blocks.delete(id),
			links
		});
	}

	/**
	 * @param {{output: (string|number)[], input: (string|number)[]}} target
	 */
	disconnectedPins(target) {
		let {state: {blocks, links}} = this;
		const names = _.filter(['input', 'output'], (a) => _.has(target, a));

		links = links.filter((link) => {
			return _.reduce(names, (current, name) => {
				const [targetId, targetIndex] = target[name];
				const [linkId, linkIndex] = link[name];

				if (targetId === linkId && (!targetIndex || targetIndex === linkIndex)) {
					const {input: [inputId, inputIndex], output: [outputId, outputIndex]} = link;

					blocks = blocks.updateIn([inputId, 'inputPins', inputIndex], (pin) => pin.disconnect()).updateIn([outputId, 'outputPins', outputIndex], (pin) => pin.disconnect());

					return false;
				}

				return current;
			}, true);
		});

		return { blocks, links };
	}
}

ReactDOM.render(<App />, document.querySelector('main'));