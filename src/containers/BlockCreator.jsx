import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { black, lblack, white } from '../color';
import { connect } from 'react-redux';
import Textarea from '../components/Textarea';
import map from 'lodash.map';
import camelCase from 'lodash.camelcase';
import upperFirst from 'lodash.upperfirst';
import actions from '../actions';
import { BlockCreator } from '../models';

const { CREATABLE_TYPE_KEYS: OPTION_LIST } = BlockCreator;
const PASCAL_OPTION_LIST = map(OPTION_LIST, (a) => upperFirst((camelCase(a))));

export default connect(
	(state) => ({
		model: state.blockCreator
	})
)(class BlockCreator extends Component {
	constructor() {
		super();

		this.onClick = this.onClick.bind(this);
		this.onChangeTextarea = this.onChangeTextarea.bind(this);
		this.onChangeSelect = this.onChangeSelect.bind(this);
		document.addEventListener('mousedown', this.onMouseDownDocument.bind(this));
	}

	render() {
		const { props: { model } } = this;

		return model.get('visible') ? (
			<div className='shadow' style={{
				backgroundColor: black,
				border: `1px solid ${lblack}`,
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				color: white,
				width: 200,
				padding: 10,
				boxSizing: 'border-box',
				fontSize: 12
			}}>
				<select value={model.get('selected')} onChange={this.onChangeSelect} style={{
					display: 'block',
					backgroundColor: lblack,
					color: 'inherit',
					width: '100%',
					border: 'none',
					marginBottom: 5,
					font: 'inherit',
					outline: 'none'
				}}>
					{map(OPTION_LIST, (a, i) => <option value={a} key={i}>{PASCAL_OPTION_LIST[i]}</option>)}
				</select>
				<Textarea onChange={this.onChangeTextarea} style={{
					fontFamily: 'Menlo, Monaco, "Courier New", monospace',
					marginBottom: 5
				}} />
				<button onClick={this.onClick} style={{
					display: 'inline-block',
					backgroundColor: lblack,
					color: 'inherit',
					borderRadius: 4,
					font: 'inherit',
					border: 'none',
					outline: 'none',
					cursor: 'pointer'
				}}>
					ADD
				</button>
			</div>
		) : null;
	}

	onClick() {
		const { props: { model, dispatch } } = this;

		dispatch(actions.addBlock({ x: model.get('x'), y: model.get('y'), value: model.get('value'), type: model.get('selected') }));
		dispatch(actions.toggleBlockCreator());
	}

	/**
	 * @param {Event} e
	 */
	onChangeTextarea(e) {
		const { currentTarget: { value } } = e;
		const { props: { dispatch } } = this;

		dispatch(actions.updateBlockCreator({ value }));
	}

	/**
	 * @param {Event} e
	 */
	onChangeSelect(e) {
		const { currentTarget: { value } } = e;
		const { props: { dispatch } } = this;

		dispatch(actions.updateBlockCreator({ selected: value }));
	}

	/**
	 * @param {MouseEvent} e 
	 */
	onMouseDownDocument(e) {
		const { target } = e;
		const { props: { dispatch } } = this;
		const $e = findDOMNode(this);

		if ($e && !findDOMNode(this).contains(target)) {
			dispatch(actions.updateBlockCreator({ visible: false }));
		}
	}
});