import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '../components/Link';
import Block from '../containers/Block';
import _ from 'lodash';

export default connect(
	(state) => ({
		blocks: state.blocks
	})
)(class PointLink extends Component {
	render() {
		const { props: { blocks, model } } = this;
		const points = [];

		_.forEach(['output', 'input'], (name) => {
			const { block: blockId, pin: pinIndex } = model.get(name);
			const block = blocks.get(blockId);
			const [x, y] = Block.pinPosition(pinIndex, name === 'output' ? Block.RIGHT_PIN : Block.LEFT_PIN);

			points.push(x + block.get('x'), y + block.get('y'));
		});

		return <Link points={points} />;
	}
});