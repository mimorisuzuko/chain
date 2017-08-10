import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { black, lblack, white, vsblue } from '../color';
import { connect } from 'react-redux';
import Textarea from '../components/Textarea';
import _ from 'lodash';
import actions from '../actions';
import { BlockCreator as BlockCreatorModel } from '../models';
import Radium from 'radium';
import { batchActions } from 'redux-batched-actions';
import autobind from 'autobind-decorator';

const { CREATABLE_TYPE_KEYS: OPTION_LIST } = BlockCreatorModel;
const PASCAL_OPTION_LIST = _.map(OPTION_LIST, (a) => _.upperFirst((_.camelCase(a))));

/**
 * 
 * @param {{value: string, onChange: Function}} props 
 */
const Select = Radium((props) => {
	const { value, children, onChange } = props;

	return (
		<select value={value} onChange={onChange} style={{
			display: 'block',
			backgroundColor: lblack,
			color: 'inherit',
			width: '100%',
			borderWidth: 1,
			borderStyle: 'solid',
			borderColor: 'transparent',
			marginBottom: 5,
			font: 'inherit',
			outline: 'none',
			':focus': {
				borderColor: vsblue
			}
		}}>
			{children}
		</select>
	);
});

@connect(
	(state) => ({
		model: state.blockCreator
	})

)
export default class BlockCreator extends Component {
	componentDidMount() {
		document.addEventListener('mousedown', this.onMouseDownDocument);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.onMouseDownDocument);
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
				<Select value={model.get('value')} onChange={this.onChangeSelect}>
					{_.map(OPTION_LIST, (a, i) => <option value={a} key={i}>{PASCAL_OPTION_LIST[i]}</option>)}
				</Select>
				<Textarea onChange={this.onChangeTextarea} style={{
					fontFamily: 'Menlo, Monaco, "Courier New", monospace',
					marginBottom: 5,
					borderWidth: 1,
					borderStyle: 'solid',
					borderColor: 'transparent',
					':focus': {
						borderColor: vsblue
					}
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

	@autobind
	onClick() {
		const { props: { model, dispatch } } = this;

		dispatch(batchActions([
			actions.addBlock({ x: model.get('x'), y: model.get('y'), value: model.get('value'), type: model.get('selected') }),
			actions.toggleBlockCreator()
		]));
	}

	/**
	 * @param {Event} e
	 */
	@autobind
	onChangeTextarea(e) {
		const { currentTarget: { value } } = e;
		const { props: { dispatch } } = this;

		dispatch(actions.updateBlockCreator({ value }));
	}

	/**
	 * @param {Event} e
	 */
	@autobind
	onChangeSelect(e) {
		const { currentTarget: { value } } = e;
		const { props: { dispatch } } = this;

		dispatch(actions.updateBlockCreator({ selected: value }));
	}

	/**
	 * @param {MouseEvent} e 
	 */
	@autobind
	onMouseDownDocument(e) {
		const { target } = e;
		const { props: { dispatch } } = this;
		const $e = findDOMNode(this);

		if ($e && !findDOMNode(this).contains(target)) {
			dispatch(actions.updateBlockCreator({ visible: false }));
		}
	}
}