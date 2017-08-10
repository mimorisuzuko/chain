import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import Block from '../containers/Block';
import BlockCreator from '../containers/BlockCreator';
import actions from '../actions';
import PointLink from '../components/PointLink';
import PinLink from '../containers/PinLink';
import _ from 'lodash';
import autobind from 'autobind-decorator';
import './Chain.scss';

@connect(
	(state) => ({
		blocks: state.blocks,
		link: state.pointLink,
		links: state.pinLinks
	})
)
export default class Chain extends Component {
	componentDidMount() {
		window.addEventListener('contextmenu', this.onContextmenu);
	}

	componentWillUnmount() {
		window.removeEventListener('contextmenu', this.onContextmenu);
	}

	render() {
		const { props: { link, links } } = this;
		let { props: { blocks } } = this;

		return (
			<div styleName='base'>
				<svg>
					{links.map((a, i) => {
						_.forEach(['input', 'output'], (key) => {
							const { block, pin } = a.get(key);
							blocks = blocks.setIn([block, `${key}Pins`, pin, 'linked'], true);
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
	@autobind
	onContextmenu(e) {
		const { clientX, clientY } = e;
		const { props: { dispatch } } = this;
		const { left, top } = findDOMNode(this).getBoundingClientRect();

		e.preventDefault();
		dispatch(actions.toggleBlockCreator(clientX - left, clientY - top));
	}
}