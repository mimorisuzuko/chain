import React, { Component } from 'react';

export const RADIUS = 7;
const S_RADIUS = 5;
const d = RADIUS + 1;

export default class Pin extends Component {
	constructor() {
		super();

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseup = this.onMouseup.bind(this);
	}

	render() {
		const { props: { cx, cy, model } } = this;
		const color = model.get('color');

		return (
			<svg onMouseDown={this.onMouseDown} onMouseUp={this.onMouseup} style={{
				position: 'absolute',
				left: cx - d,
				top: cy - d,
				width: RADIUS * 2 + 2,
				height: RADIUS * 2 + 2,
				cursor: 'pointer'
			}}>
				<circle cx={d} cy={d} r={S_RADIUS} fill={color} />
				<circle cx={d} cy={d} r={RADIUS} fill={'none'} stroke={color} />
			</svg>
		);
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseDown(e) {
		const { props: { model, onMouseDown } } = this;

		onMouseDown(e, model);
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseup(e) {
		const { props: { model, onMouseUp } } = this;

		onMouseUp(e, model);
	}
}