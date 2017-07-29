import React, { Component } from 'react';
import { connect } from 'react-redux';
import Block from '../containers/Block';
import { black } from '../color';

export default connect(
	(state) => ({
		blocks: state.blocks
	})
)(class App extends Component {
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
			</div>
		);
	}
});