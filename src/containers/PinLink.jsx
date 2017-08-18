import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '../components/Link';
import _ from 'lodash';

@connect(
	(state) => ({
		blocks: state.blocks
	})
)
export default class PinLink extends Component {
	render() {
		const { props: { blocks, model } } = this;
		const points = [];

		_.forEach(['output', 'input'], (name) => {
			const block = blocks.find((a) => a.get('id') === model.getIn([name, 'block']));
			const pin = block.getIn([`${name}Pins`, model.getIn([name, 'pin'])]);

			points.push(pin.get('cx'), pin.get('cy'));
		});

		return <Link points={points} />;
	}
}