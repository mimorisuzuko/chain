import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '../components/Link';
import _ from 'lodash';

@connect(
	(state) => ({
		blocks: state.blocks
	})
)
export default class PointLink extends Component {
	render() {
		const { props: { blocks, model } } = this;
		const points = [];

		_.forEach(['output', 'input'], (name) => {
			const { block: blockId, pin: pinIndex } = model.get(name);
			const pin = blocks.getIn([blockId, `${name}Pins`, pinIndex]);

			points.push(pin.get('cx'), pin.get('cy'));
		});

		return <Link points={points} />;
	}
}