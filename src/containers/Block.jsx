import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../actions';
import autobind from 'autobind-decorator';
import IndentTextarea from '../components/IndentTextarea';
import { getMouseOrFirstTouchPosition } from '../util';
import './Block.scss';

window.ontouchmove = () => { };

@connect()
export default class Block extends Component {
	constructor() {
		super();

		this.prevX = 0;
		this.prevY = 0;
	}

	render() {
		const { props: { model } } = this;
		const color = model.get('color');

		return (
			<div styleName='base' onMouseDown={this.onMouseDownOrTouchStart} onTouchStart={this.onMouseDownOrTouchStart} style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				height: model.get('height')
			}}>
				<div>
					{model.get('deletable') ? <button styleName='red' onClick={this.onClickDeleteButton}>x</button> : null}
					{model.get('changeable') ? <button onClick={this.addPin}>+</button> : null}
					{model.get('changeable') ? <button onClick={this.deletePin}>-</button> : null}
				</div>
				<div styleName='textarea-div'>
					<IndentTextarea readOnly={!model.get('editable')} onChange={this.onChange} value={model.get('value')} spellCheck={false} style={{ borderLeft: `5px solid ${color}` }} onKeyDown={this.onKeyDown} />
				</div>
			</div>
		);
	}

	/**
	 * @param {Event} e 
	 */
	@autobind
	onChange(e) {
		const { props: { model, dispatch } } = this;

		dispatch(actions.updateBlock(model.get('id'), { value: e.currentTarget.value }));
	}

	@autobind
	onClickDeleteButton() {
		const { props: { model, dispatch } } = this;
		const id = model.get('id');

		dispatch(actions.deleteBlock(id));
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseDownOrTouchStart(e) {
		const { target: { nodeName } } = e;

		if (nodeName === 'DIV') {
			const { pageX, pageY } = getMouseOrFirstTouchPosition(e);

			this.prevX = pageX;
			this.prevY = pageY;
			document.body.classList.add('cursor-move');
			document.addEventListener('mousemove', this.onMouseMoveOrTouchMoveDocument);
			document.addEventListener('mouseup', this.onMouseUpOrTouchEndDocument);
			document.addEventListener('touchmove', this.onMouseMoveOrTouchMoveDocument);
			document.addEventListener('touchend', this.onMouseUpOrTouchEndDocument);
		}
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMoveOrTouchMoveDocument(e) {
		const { pageX, pageY } = getMouseOrFirstTouchPosition(e);
		const { props: { model, dispatch }, prevX, prevY } = this;

		e.preventDefault();
		dispatch(actions.deltaMoveBlock(model.get('id'), pageX - prevX, pageY - prevY));
		this.prevX = pageX;
		this.prevY = pageY;
	}

	@autobind
	onMouseUpOrTouchEndDocument() {
		document.body.classList.remove('cursor-move');
		document.removeEventListener('mousemove', this.onMouseMoveOrTouchMoveDocument);
		document.removeEventListener('mouseup', this.onMouseUpOrTouchEndDocument);
		document.removeEventListener('touchmove', this.onMouseMoveOrTouchMoveDocument);
		document.removeEventListener('touchend', this.onMouseUpOrTouchEndDocument);
	}

	@autobind
	addPin() {
		const { props: { model, dispatch } } = this;

		dispatch(actions.addPin(model.get('id')));
	}

	@autobind
	deletePin() {
		const { props: { model, dispatch } } = this;

		dispatch(actions.deletePin({
			id: model.get('id'),
			removed: model.get('inputPins').size - 1
		}));
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
			dispatch(actions.updateBlock(model.get('id'), { value: `${v.substring(0, selectionStart)}\t${v.substring(selectionEnd)}` }));
		}
	}
}