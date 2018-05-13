import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import actions from '../actions';
import { BLOCK } from '../constants/index';
import { batchActions } from 'redux-batched-actions';
import autobind from 'autobind-decorator';
import IndentTextarea from '../components/IndentTextarea';
import './BlockCreator.scss';

const OPTION_LIST = [BLOCK.TYPE_VALUE, BLOCK.TYPE_FUNCTION, BLOCK.TYPE_PROPERTY, BLOCK.TYPE_OPERATOR];
const PASCAL_OPTION_LIST = _.map(OPTION_LIST, (a) => _.upperFirst((_.camelCase(a))));

@connect()
export default class BlockCreator extends Component {
	componentWillUpdate(nextProps) {
		const { model: nextModel } = nextProps;
		const { props: { model } } = this;

		if (!model.get('visible') && nextModel.get('visible')) {
			document.addEventListener('mousedown', this.onMouseDownOrTouchStartDocument);
			document.addEventListener('touchstart', this.onMouseDownOrTouchStartDocument);
		}
	}

	@autobind
	onClick() {
		const { props: { model, dispatch } } = this;

		document.removeEventListener('mousedown', this.onMouseDownOrTouchStartDocument);
		document.removeEventListener('touchstart', this.onMouseDownOrTouchStartDocument);
		dispatch(batchActions([
			actions.addBlock({ x: model.get('x'), y: model.get('y'), value: _.trim(model.get('value')), type: model.get('selected') }),
			actions.updateBlockCreator({ visible: false })
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
	onMouseDownOrTouchStartDocument(e) {
		const { target } = e;
		const { props: { dispatch } } = this;
		const $e = findDOMNode(this);

		if ($e && !$e.contains(target)) {
			dispatch(actions.updateBlockCreator({ visible: false }));
			document.removeEventListener('mousedown', this.onMouseDownOrTouchStartDocument);
			document.removeEventListener('touchstart', this.onMouseDownOrTouchStartDocument);
		}
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	@autobind
	onKeyDown(e) {
		const { keyCode, currentTarget: { selectionStart, selectionEnd } } = e;
		const { props: { dispatch, model } } = this;

		if (keyCode === 9) {
			e.preventDefault();
			const v = model.get('value');
			dispatch(actions.updateBlockCreator({ value: `${v.substring(0, selectionStart)}\t${v.substring(selectionEnd)}` }));
		}
	}

	render() {
		const { props: { model } } = this;

		return model.get('visible') ? (
			<div styleName='base' style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
			}}
			>
				<select value={model.get('selected')} onChange={this.onChangeSelect}>
					{_.map(OPTION_LIST, (a, i) => <option value={a} key={i}>{PASCAL_OPTION_LIST[i]}</option>)}
				</select>
				<IndentTextarea onChange={this.onChangeTextarea} value={model.get('value')} spellCheck={false} onKeyDown={this.onKeyDown} />
				<button onClick={this.onClick}>
					ADD
				</button>
			</div>
		) : null;
	}
}
