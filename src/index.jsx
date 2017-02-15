const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const Immutable = require('immutable');
const {Block, BlockModel} = require('./components/block.jsx');
const {Link, LinkModel} = require('./components/link.jsx');
const {BlockCreator, BlockCreatorModel} = require('./components/block-creator.jsx');
const {Component} = React;
const {List, Map} = Immutable;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.connectMover = null;
		this.connectEnder = null;
		this.tempBlockAndPin = null;
		this.isMouseDown = false;
		this.state = {
			blocks: Map(),
			links: List(),
			tempLink: new LinkModel(),
			onConnectPinEnd: null,
			blockCreator: new BlockCreatorModel()
		};
	}

	render() {
		const {state: {blocks: _blocks, links: _links, tempLink, onConnectPinEnd, blockCreator}} = this;
		let blocks = _blocks;
		const links = _links.map(({out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex]}) => {
			const pintopin = _.map([[oBlockId, 'outputPins', oPinIndex], [iBlockId, 'inputPins', iPinIndex]], (key) => {
				const [id] = key;

				blocks = blocks.setIn(_.concat(key, 'connected'), true);

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
					onMouseDown={this.onMouseDown.bind(this)}
					onMouseMove={this.onMouseMove.bind(this)}
					onMouseUp={this.onMouseUp.bind(this)}
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
						blocks.entrySeq().map(([id, model]) => (
							<Block
								model={model}
								onConnectPinStart={this.onConnectPinStart.bind(this, id)}
								onConnectPinEnd={onConnectPinEnd ? onConnectPinEnd.bind(this, id) : () => { }}
								update={this.updateBlock.bind(this, id)}
								remove={this.removeBlock.bind(this, id)}
							/>
						))
					}
					{<BlockCreator model={blockCreator} add={this.addBlock.bind(this)} update={this.updateBlockCreator.bind(this)} />}
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
	onMouseMove(e) {
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
	 * @param {string} blockId
	 * @param {PinModel} pin
	 */
	onConnectPinStart(blockId, pin) {
		const {state: {blocks, tempLink, links}, onConnectPinEnd} = this;
		const connectPinMover = this.onConnectMove.bind(this);
		const connectPinEnder = this.onConnectEnd.bind(this);
		const [x, y] = blocks.get(blockId).absoluteCentralPositionOf(pin);
		const pinIndex = pin.get('index');

		document.addEventListener('mousemove', connectPinMover);
		document.addEventListener('mouseup', connectPinEnder);
		this.tempBlockAndPin = [blockId, pin];
		this.connectPinMover = connectPinMover;
		this.connectPinEnder = connectPinEnder;
		this.setState({
			tempLink: tempLink.start(x, y),
			onConnectPinEnd,
			links: pin.get('type') === 1 ? links.filter(({ in: [id, index]}) => !(blockId === id && pinIndex === index)) : links
		});
	}

	/**
	 * @param {string} id0
	 * @param {PinModel} pin0
	 */
	onConnectPinEnd(id0, pin0) {
		const {tempBlockAndPin: [id1, pin1], state: {links}} = this;
		const [[type0, index0], [type1, index1]] = _.map([pin0, pin1], (a) => [a.get('type'), a.get('index')]);

		if (id0 === id1 || type0 === type1) { return; }
		const [[oBlockId, oPinIndex], [iBlockId, iPinIndex]] = _.sortBy([[id0, index0, type0], [id1, index1, type1]], 2);

		this.setState({
			links: links.filter(({in: [id, index]}) => !(id === iBlockId && iPinIndex === index)).push({ out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex] })
		});
	}

	/**
	 * @param {MouseEvent} e
	 */
	onConnectMove(e) {
		const {state: {tempLink}} = this;
		const [x, y] = this.mouse(e);

		this.setState({ tempLink: tempLink.end(x, y) });
	}

	onConnectEnd() {
		const {connectMover, connectEnder, state: {tempLink}} = this;

		document.removeEventListener('mousemove', connectMover);
		document.removeEventListener('mouseup', connectEnder);
		this.setState({ tempLink: tempLink.set('visible', false), onConnectPinEnd: null });
	}

	addBlock() {
		const {state: {blockCreator, blocks}} = this;
		const x = blockCreator.get('x');
		const y = blockCreator.get('y');
		const value = blockCreator.get('value');
		const block = new BlockModel({ x, y, value });
		const id = block.get('id');

		this.setState({ blocks: blocks.set(id, block), blockCreator: blockCreator.set('visible', false) });
	}

	/**
	 * @param {string} id
	 * @param {BlockModel} model
	 * @param {boolean} shouldLinkUpdate
	 */
	updateBlock(id, model, shouldLinkUpdate) {
		const {state: {blocks, links}} = this;
		const {size: index} = model.get('outputPins');

		this.setState({
			blocks: blocks.set(id, model),
			links: shouldLinkUpdate ? links.filter(({out: [oBlockId, oPinIndex]}) => !(oBlockId === id && oPinIndex === index)) : links
		});
	}

	/**
	 * @param {string} id
	 */
	removeBlock(id) {
		const {state: {blocks, links}} = this;

		this.setState({
			blocks: blocks.delete(id),
			links: links.filter(({out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex]}) => !(oBlockId === id || iBlockId === id))
		});
	}
}

const $main = document.querySelector('main');
ReactDOM.render(<App />, $main);