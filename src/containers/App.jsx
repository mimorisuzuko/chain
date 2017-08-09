import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import Block from '../containers/Block';
import { black } from '../color';
import BlockCreator from '../containers/BlockCreator';
import actions from '../actions';
import PointLink from '../components/PointLink';
import PinLink from '../containers/PinLink';
import _ from 'lodash';

export default connect(
	(state) => ({
		blocks: state.blocks,
		link: state.pointLink,
		links: state.pinLinks
	})
)(class App extends Component {
	constructor() {
		super();

		window.addEventListener('contextmenu', this.onContextmenu.bind(this));
	}

	render() {
		const { props: { link, links } } = this;
		let { props: { blocks } } = this;

		return (
			<div style={{
				backgroundColor: black,
				position: 'relative'
			}}>
				<svg style={{
					display: 'block',
					width: '100%',
					height: '100%',
					position: 'absolute',
					left: 0,
					top: 0
				}}>
					{links.map((a, i) => {
						_.forEach(['input', 'output'], (key) => {
							const { block, pin } = a.get(key);
							blocks =  blocks.setIn([block, `${key}Pins`, pin, 'linked'], true);
						});

						return <PinLink key={i} model={a} />;
					})}
					<PointLink model={link} />
				</svg>
				{blocks.map((model) => <Block key={model.get('id')} model={model} />)}
				<BlockCreator />
			</div>
		);
	}

	/**
	 * @param {MouseEvent} e
	 */
	onContextmenu(e) {
		const { clientX, clientY } = e;
		const { props: { dispatch } } = this;
		const { left, top } = findDOMNode(this).getBoundingClientRect();

		e.preventDefault();
		dispatch(actions.toggleBlockCreator(clientX - left, clientY - top));
	}
});