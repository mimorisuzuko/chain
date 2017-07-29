import React, { Component } from 'react';
import { white, lblack, red } from '../color';
import { connect } from 'react-redux';
import actions from '../actions';

export default connect()(class Block extends Component {
	constructor() {
		super();

		this.mouseDownX = 0;
		this.mouseDownY = 0;
		this.onChange = this.onChange.bind(this);
		this.onClickDeleteButton = this.onClickDeleteButton.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveDocument = this.onMouseMoveDocument.bind(this);
		this.onMouseUpDocument = this.onMouseUpDocument.bind(this);
	}

	render() {
		const { props: { model } } = this;

		return (
			<div onMouseDown={this.onMouseDown} style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				fontSize: 12,
				fontFamily: 'Menlo, Monaco, "Courier New", monospace',
				color: white,
				border: `1px solid ${lblack}`,
				width: 200,
				boxSizing: 'border-box'
			}}>
				<div>
					{model.get('deletable') ? <button onClick={this.onClickDeleteButton} style={{
						display: 'inline-block',
						textDecoration: 'none',
						color: 'inherit',
						backgroundColor: red,
						border: 'none',
						font: 'inherit',
						padding: '1px 8px',
						outline: 'none',
						cursor: 'pointer'
					}}>
						×
					</button> : null}
				</div>
				<div style={{
					padding: 5
				}}>
					<textarea readOnly={!model.get('editable')} onChange={this.onChange} value={model.get('value')} style={{
						display: 'block',
						font: 'inherit',
						color: 'inherit',
						backgroundColor: lblack,
						border: 'none',
						outline: 'none',
						width: '100%',
						boxSizing: 'border-box'
					}} />
				</div>
			</div>
		);
	}

	/**
	 * @param {Event} e 
	 */
	onChange(e) {
		const { props: { model, dispatch } } = this;

		dispatch(actions.updateBlock(model.get('id'), { value: e.currentTarget.value }));
	}

	onClickDeleteButton() {
		const { props: { model, dispatch } } = this;

		dispatch(actions.deleteBlock(model.get('id')));
	}

	/**
	 * @param {MouseEvent} e
	 */
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
	onMouseMoveDocument(e) {
		const { pageX, pageY } = e;
		const { props: { model, dispatch }, mouseDownX, mouseDownY } = this;

		dispatch(actions.deltaMoveBlock(model.get('id'), pageX - mouseDownX, pageY - mouseDownY));
		this.mouseDownX = pageX;
		this.mouseDownY = pageY;
	}

	onMouseUpDocument() {
		document.body.classList.remove('cursor-move');
		document.removeEventListener('mousemove', this.onMouseMoveDocument);
		document.removeEventListener('mouseup', this.onMouseUpDocument);
	}
});