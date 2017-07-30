import React, { Component } from 'react';
import { white, lblack, red, black } from '../color';
import { connect } from 'react-redux';
import actions from '../actions';
import BlockButton from '../components/BlockButton';
import Pin, { RADIUS } from '../components/Pin';
import Textarea from '../components/Textarea';
import { Pin as PinModel } from '../models';

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
		this.addPin = this.addPin.bind(this);
		this.deletePin = this.deletePin.bind(this);
		this.onConnectStart = this.onConnectStart.bind(this);
		this.onConnecting = this.onConnecting.bind(this);
		this.onConnectEnd = this.onConnectEnd.bind(this);
		this.onConnectPin = this.onConnectPin.bind(this);
	}

	render() {
		const { props: { model } } = this;
		const color = model.get('color');

		return (
			<div className='shadow' onMouseDown={this.onMouseDown} style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				fontSize: 12,
				color: white,
				border: `1px solid ${lblack}`,
				width: Block.WIDTH,
				backgroundColor: black,
				boxSizing: 'border-box'
			}}>
				<div>
					{model.get('deletable') ? <BlockButton onClick={this.onClickDeleteButton} style={{ backgroundColor: red, marginRight: 1 }} value='×' /> : null}
					{model.get('changeable') ? <BlockButton onClick={this.addPin} style={{ backgroundColor: lblack, marginRight: 1 }} value='+' /> : null}
					{model.get('changeable') ? <BlockButton onClick={this.deletePin} style={{ backgroundColor: lblack }} value='-' /> : null}
				</div>
				<div style={{
					margin: 5,
					borderLeft: `5px solid ${color}`
				}}>
					<Textarea readOnly={!model.get('editable')} onChange={this.onChange} value={model.get('value')} style={{
						fontFamily: 'Menlo, Monaco, "Courier New", monospace',
						borderTop: '1px solid transparent',
						borderRight: '1px solid transparent',
						borderBottom: '1px solid transparent',
						borderLeft: 'none',
						':focus': {
							borderTop: `1px solid ${color}`,
							borderRight: `1px solid ${color}`,
							borderBottom: `1px solid ${color}`,
						}
					}} />
				</div>
				{model.get('inputPins').map((model, i) => {
					const [x, y] = Block.pinPosition(i, PinModel.INPUT);

					return <Pin key={model.get('index')} cx={x} cy={y} model={model} onMouseDown={this.onConnectStart} onMouseUp={this.onConnectPin} />;
				})}
				{model.get('outputPins').map((model, i) => {
					const [x, y] = Block.pinPosition(i, PinModel.OUTPUT);

					return <Pin key={model.get('index')} cx={x} cy={y} model={model} onMouseDown={this.onConnectStart} onMouseUp={this.onConnectPin} />;
				})}
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

	addPin() {
		const { props: { model, dispatch } } = this;

		dispatch(actions.addPin(model.get('id')));
	}

	deletePin() {
		const { props: { model, dispatch } } = this;

		dispatch(actions.deletePin(model.get('id')));
	}

	/**
	 * @param {MouseEvent} e
	 * @param {any} pin
	 */
	onConnectStart(e, pin) {
		const { props: { dispatch, model } } = this;
		const { clientX, clientY } = e;

		dispatch(actions.startPointLink({ x: clientX, y: clientY }));
		document.addEventListener('mousemove', this.onConnecting);
		document.addEventListener('mouseup', this.onConnectEnd);
		window.__connection__ = { block: model.get('id'), pin: pin.get('index'), pinType: pin.get('type') };
	}

	/**
	 * @param {MouseEvent} e
	 */
	onConnecting(e) {
		const { props: { dispatch } } = this;
		const { clientX, clientY } = e;

		dispatch(actions.endPointLink({ x: clientX, y: clientY }));
	}

	onConnectEnd() {
		const { props: { dispatch } } = this;

		dispatch(actions.startPointLink({ x: 0, y: 0 }));
		document.removeEventListener('mousemove', this.onConnecting);
		document.removeEventListener('mouseup', this.onConnectEnd);
	}

	/**
	 * @param {MouseEvent} e
	 * @param {any} pin
	 */
	onConnectPin(e, pin) {
		const { __connection__: { block: block0, pin: pin0, pinType: pinType0 } } = window;
		const { props: { model, dispatch } } = this;
		const block1 = model.get('id');
		const pin1 = pin.get('index');
		const pinType1 = pin.get('type');

		if (block0 !== block1 && pinType0 !== pinType1) {
			dispatch(actions.addPinLink({
				[pinType0 === PinModel.OUTPUT ? 'output' : 'input']: { block: block0, pin: pin0 },
				[pinType1 === PinModel.OUTPUT ? 'output' : 'input']: { block: block1, pin: pin1 }
			}));
		}
	}

	/**
	 * @param {number} index 
	 * @param {string} direction 
	 */
	static pinPosition(index, direction) {
		return [
			direction === PinModel.INPUT ? -RADIUS - 2 : Block.WIDTH + RADIUS,
			RADIUS + (RADIUS * 2 + 3) * index
		];
	}

	static get WIDTH() {
		return 200;
	}
});