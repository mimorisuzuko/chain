const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const Immutable = require('immutable');
const {Block, BlockModel} = require('./components/block.jsx');
const {Link} = require('./components/link.jsx');
const {Component} = React;
const {List, Map} = Immutable;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			blocks: Map(),
			links: List()
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
		let {state: {blocks, links}} = this;

		links = links.map(({out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex]}) => {
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
				</svg>
				<div style={{
					width: '100%',
					height: '100%',
				}}>
					{
						blocks.entrySeq().map(([id, model]) => (
							<Block
								model={model}
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