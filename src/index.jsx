const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const Immutable = require('immutable');
const {Block, BlockModel} = require('./components/block.jsx');
const {Link, LinkModel} = require('./components/link.jsx');
const {Component} = React;
const {List, Map} = Immutable;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.connectMover = null;
		this.connectEnder = null;
		this.tempBlockAndPin = null;
		this.state = {
			blocks: Map(),
			links: List(),
			tempLink: new LinkModel(),
			onConnectPinEnd: null
		};

		setTimeout(() => {
			console.log('Debug: createBlock()');
			this.createBlock(100, 100);
			this.createBlock(400, 80);
			this.createBlock(700, 100);

			console.log('Debug: connectPins()');
			const [a, b, c] = _.keys(this.state.blocks.toJS());
			this.connectPins(a, 0, b, 0);
			this.connectPins(a, 0, c, 0);
		}, 1000);
	}

	render() {
		const {state: {blocks: _blocks, links: _links, tempLink, onConnectPinEnd}} = this;
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
				<svg style={{
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
				</div>
			</div>
		);
	}

	/**
	 * @param {string} id
	 * @param {PinModel} pin
	 */
	onConnectPinStart(id, pin) {
		const {state: {blocks, tempLink}, onConnectPinEnd} = this;
		const connectPinMover = this.onConnectMove.bind(this);
		const connectPinEnder = this.onConnectEnd.bind(this);
		const [x, y] = blocks.get(id).absoluteCentralPositionOf(pin);

		document.addEventListener('mousemove', connectPinMover);
		document.addEventListener('mouseup', connectPinEnder);
		this.tempBlockAndPin = [id, pin];
		this.connectPinMover = connectPinMover;
		this.connectPinEnder = connectPinEnder;
		this.setState({ tempLink: tempLink.start(x, y), onConnectPinEnd });
	}

	/**
	 * @param {string} id0
	 * @param {PinModel} pin0
	 */
	onConnectPinEnd(id0, pin0) {
		const {tempBlockAndPin: [id1, pin1]} = this;
		const [type0, type1] = _.map([pin0, pin1], (a) => a.get('type'));

		if (id0 === id1 || type0 === type1) { return; }
		const [[a, b], [c, d]] = _.sortBy([[id0, pin0, type0], [id1, pin1, type1]], 2);

		this.connectPins(a, b.get('index'), c, d.get('index'));
	}

	/**
	 * @param {MouseEvent} e
	 */
	onConnectMove(e) {
		const {state: {tempLink}} = this;
		const {clientX, clientY} = e;
		const {left, top} = ReactDOM.findDOMNode(this).getBoundingClientRect();
		const x = clientX - left;
		const y = clientY - top;

		this.setState({ tempLink: tempLink.end(x, y) });
	}

	onConnectEnd() {
		const {connectMover, connectEnder, state: {tempLink}} = this;

		document.removeEventListener('mousemove', connectMover);
		document.removeEventListener('mouseup', connectEnder);
		this.setState({ tempLink: tempLink.set('visible', false), onConnectPinEnd: null });
	}

	/**
	 * @param {string} oBlockId
	 * @param {number} oPinIndex
	 * @param {string} iBlockId
	 * @param {number} iPinIndex
	 */
	connectPins(oBlockId, oPinIndex, iBlockId, iPinIndex) {
		const {state: {links}} = this;

		this.setState({ links: links.push({ out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex] }) });
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	createBlock(x, y) {
		const {state: {blocks}} = this;
		const block = new BlockModel({ x, y });
		const id = block.get('id');

		this.setState({ blocks: blocks.set(id, block) });
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