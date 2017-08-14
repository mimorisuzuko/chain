import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../actions';
import { Pin as PinModel } from '../models';
import autobind from 'autobind-decorator';
import './Block.scss';

@connect()
export default class Block extends Component {
	constructor() {
		super();

		this.mouseDownX = 0;
		this.mouseDownY = 0;
	}

	render() {
		const { props: { model } } = this;
		const color = model.get('color');

		return (
			<div styleName='base' onMouseDown={this.onMouseDown} style={{
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
					<textarea readOnly={!model.get('editable')} onChange={this.onChange} value={model.get('value')} spellCheck={false} style={{ borderLeft: `5px solid ${color}` }} />
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
	onMouseDown(e) {
		const { target: { nodeName }, pageX, pageY } = e;

		if (nodeName === 'DIV') {
			this.mouseDownX = pageX;
			this.mouseDownY = pageY;
			document.body.classList.add('cursor-move');
			document.addEventListener('mousemove', this.onMouseMoveDocument);
			document.addEventListener('mouseup', this.onMouseUpDocument);
		}
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMoveDocument(e) {
		const { pageX, pageY } = e;
		const { props: { model, dispatch }, mouseDownX, mouseDownY } = this;

		dispatch(actions.deltaMoveBlock(model.get('id'), pageX - mouseDownX, pageY - mouseDownY));
		this.mouseDownX = pageX;
		this.mouseDownY = pageY;
	}

	@autobind
	onMouseUpDocument() {
		document.body.classList.remove('cursor-move');
		document.removeEventListener('mousemove', this.onMouseMoveDocument);
		document.removeEventListener('mouseup', this.onMouseUpDocument);
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

	static convertPinType(pinType) {
		if (pinType === PinModel.OUTPUT) {
			return 'output';
		} else if (pinType === PinModel.INPUT) {
			return 'input';
		}

		return 'unknown';
	}
}