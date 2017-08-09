import React, { Component } from 'react';
import { Pin as PinModel } from '../models';

export const RADIUS = 7;
const S_RADIUS = RADIUS - 3;
const d = RADIUS + 1;

export default class Pin extends Component {
	constructor() {
		super();

		this.state = { enter: false, connecting: false };
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseup = this.onMouseup.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseUpDocument = this.onMouseUpDocument.bind(this);
	}

	render() {
		const { props: { cx, cy, model }, state: { enter, connecting } } = this;
		const color = model.get('color');

		return (
			<svg
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseup}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				style={{
					position: 'absolute',
					left: cx - d,
					top: cy - d,
					width: RADIUS * 2 + 2,
					height: RADIUS * 2 + 2,
					cursor: 'pointer'
				}}>
				<circle cx={d} cy={d} r={S_RADIUS} fill={model.get('type') === PinModel.INPUT ? 'none' : color} stroke={color} />
				{enter || connecting || model.get('linked') ? <circle cx={d} cy={d} r={RADIUS} fill={'none'} stroke={color} /> : null}
			</svg>
		);
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseDown(e) {
		const { props: { model, onMouseDown } } = this;

		onMouseDown(e, model);
		document.addEventListener('mouseup', this.onMouseUpDocument);
		this.setState({ connecting: true });
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseup(e) {
		const { props: { model, onMouseUp } } = this;

		onMouseUp(e, model);
	}

	onMouseEnter() {
		this.setState({ enter: true });
	}

	onMouseLeave() {
		this.setState({ enter: false });
	}

	onMouseUpDocument() {
		document.removeEventListener('mouseup', this.onMouseUpDocument);
		this.setState({ connecting: false });
	}
}