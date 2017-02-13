const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const {Block, BlockModel} = require('./components/block.jsx');
const {Component} = React;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			blocks: [new BlockModel({ x: 100, y: 100 }), new BlockModel({ x: 500, y: 80 })]
		};
	}

	render() {
		const {state: {blocks}} = this;

		return (
			<div style={{
				width: '100%',
				height: '100%',
				position: 'relative'
			}}>
				{_.map(blocks, (a, i) => (
					<Block
						model={a}
						update={this.updateBlock.bind(this, i)}
						remove={this.removeBlock.bind(this, i)}
					/>
				))}
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