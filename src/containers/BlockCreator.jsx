import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import actions from '../actions';
import { BlockCreator as BlockCreatorModel } from '../models';
import { batchActions } from 'redux-batched-actions';
import autobind from 'autobind-decorator';
import './BlockCreator.scss';

const { CREATABLE_TYPE_KEYS: OPTION_LIST } = BlockCreatorModel;
const PASCAL_OPTION_LIST = _.map(OPTION_LIST, (a) => _.upperFirst((_.camelCase(a))));

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
			<div styleName='base' style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
			}}>
				<select value={model.get('selected')} onChange={this.onChangeSelect}>
					{_.map(OPTION_LIST, (a, i) => <option value={a} key={i}>{PASCAL_OPTION_LIST[i]}</option>)}
				</select>
				<textarea onChange={this.onChangeTextarea} value={model.get('value')} />
				<button onClick={this.onClick}>
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