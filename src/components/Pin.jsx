import React, { Component } from 'react';
import { Pin as PinModel } from '../models';
import autobind from 'autobind-decorator';

const d = PinModel.RADIUS + 1;

export default class Pin extends Component {
	constructor() {
		super();

		this.state = { enter: false, connecting: false };
	}

	render() {
		const { props: { model }, state: { enter, connecting } } = this;
		const color = model.get('color');
		const type = model.get('type');

		return (
			<svg
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseup}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				style={{
					position: 'absolute',
					left: model.get('cx') - d,
					top: model.get('cy') - d,
					width: PinModel.RADIUS * 2 + 2,
					height: PinModel.RADIUS * 2 + 2,
					cursor: 'pointer'
				}}>
				<circle cx={d} cy={d} r={PinModel.S_RADIUS} fill={type === PinModel.INPUT ? 'none' : type === PinModel.OUTPUT ? color : 'red'} stroke={color} />
				{enter || connecting || model.get('linked') ? <circle cx={d} cy={d} r={PinModel.RADIUS} fill={'none'} stroke={color} /> : null}
			</svg>
		);
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseDown(e) {
		const { props: { model, onMouseDown, parent } } = this;

		onMouseDown(e, model, parent);
		document.addEventListener('mouseup', this.onMouseUpDocument);
		this.setState({ connecting: true });
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseup(e) {
		const { props: { model, onMouseUp, parent } } = this;

		onMouseUp(e, model, parent);
	}

	@autobind
	onMouseEnter() {
		this.setState({ enter: true });
	}

	@autobind
	onMouseLeave() {
		this.setState({ enter: false });
	}

	@autobind
	onMouseUpDocument() {
		document.removeEventListener('mouseup', this.onMouseUpDocument);
		this.setState({ connecting: false });
	}
}