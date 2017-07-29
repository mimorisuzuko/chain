import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import Block from '../containers/Block';
import { black } from '../color';
import BlockCreator from '../containers/BlockCreator';
import actions from '../actions';

export default connect(
	(state) => ({
		blocks: state.blocks
	})
)(class App extends Component {
	constructor() {
		super();

		window.addEventListener('contextmenu', this.onContextmenu.bind(this));
	}

	render() {
		const { props: { blocks } } = this;

		return (
			<div style={{
				backgroundColor: black,
				position: 'relative'
			}}>
				{blocks.map((model) => (
					<Block
						key={model.get('id')}
						model={model}
					/>
				))}
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