const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const {Block, BlockModel} = require('./components/block.jsx');
const {Link} = require('./components/link.jsx');
const {Component} = React;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			blocks: [new BlockModel({ x: 100, y: 100 }), new BlockModel({ x: 500, y: 80 })],
			links: [{ out: [0, 0], in: [1, 0] }]
		};
	}

	render() {
		const {state: {blocks, links: _links}} = this;
		const links = _.map(_links, ({out: [oBlockIndex, oPinIndex], in: [iBlockIndex, iPinIndex]}) => {
			const oBlock = blocks[oBlockIndex];
			const oPin = oBlock.get('outputPins').get(oPinIndex);
			const iBlock = blocks[iBlockIndex];
			const iPin = iBlock.get('inputPins').get(iPinIndex);

			return <Link from={oBlock.absoluteCentralPositionOf(oPin)} to={iBlock.absoluteCentralPositionOf(iPin)} />;
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
					{_.map(blocks, (a, i) => (
						<Block
							model={a}
							update={this.updateBlock.bind(this, i)}
							remove={this.removeBlock.bind(this, i)}
						/>
					))}
				</div>
			</div>
		);
	}

	/**
	 * @param {number} index
	 * @param {BlockModel} model
	 */
	updateBlock(index, model) {
		const {state: {blocks}} = this;

		blocks[index] = model;
		this.setState({ blocks });
	}

	/**
	 * @param {number} index
	 */
	removeBlock(index) {
		const {state: {blocks}} = this;

		this.setState({ blocks: _.filter(blocks, (a, i) => i !== index) });
	}
}

const $main = document.querySelector('main');
ReactDOM.render(<App />, $main);