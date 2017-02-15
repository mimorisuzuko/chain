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
			this.createBlock(500, 80);

			console.log('Debug: link()');
			const [a, b] = _.keys(this.state.blocks.toJS());
			this.link(a, 0, b, 0);
		}, 2000);
	}

	render() {
		const {state: {blocks, links: _links}} = this;
		const links = _links.map(({out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex]}) => {
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
	link(oBlockId, oPinIndex, iBlockId, iPinIndex) {
		const {state: {blocks, links}} = this;
		const okeys = [oBlockId, 'outputPins', oPinIndex, 'connected'];
		const ikeys = [iBlockId, 'inputPins', iPinIndex, 'connected'];

		this.setState({
			blocks: blocks.setIn(okeys, true).setIn(ikeys, true),
			links: links.push({ out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex] })
		});
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
	 */
	updateBlock(id, model) {
		const {state: {blocks}} = this;

		this.setState({ blocks: blocks.set(id, model) });
	}

	/**
	 * @param {string} id
	 */
	removeBlock(id) {
		const {state: {blocks: _blocks, links: _links}} = this;
		const keys = [];
		const links = _links.filter(({out: [oBlockId, oPinIndex], in: [iBlockId, iPinIndex]}) => {
			if (oBlockId === id) {
				keys.push([iBlockId, 'inputPins', iPinIndex, 'connected']);
				return false;
			} else if (iBlockId === id) {
				keys.push([oBlockId, 'outputPins', oPinIndex, 'connected']);
				return false;
			}

			return true;
		});
		let blocks = _blocks.delete(id);

		_.forEach(keys, (key) => {
			blocks = blocks.setIn(key, false);
		});

		this.setState({ blocks, links });
	}
}

const $main = document.querySelector('main');
ReactDOM.render(<App />, $main);