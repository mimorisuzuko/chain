import React, { Component } from 'react';
import { Pin as PinModel } from '../models';
import autobind from 'autobind-decorator';
import { onMouseDownOrTouchStart, addMouseUpOrTouchEndListener } from '../util';
import _ from 'lodash';

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
				data-pin
				{...{ [onMouseDownOrTouchStart]: this.onMouseDownOrTouchStart }}
				onMouseUp={this.onMouseup}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				onTouchEnd={this.onTouchEnd}
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
	onMouseDownOrTouchStart(e) {
		const { props } = this;
		const { model, parent } = props;

		props[onMouseDownOrTouchStart](e, model, parent);
		addMouseUpOrTouchEndListener(document, this.onMouseUpOrTouchEndDocument);
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

	/**
	 * @param {TouchEvent} e
	 */
	@autobind
	onTouchEnd(e) {
		const { pageX, pageY } = e.changedTouches.item(0);
		_.some(document.querySelectorAll('[data-pin]'), ($e) => {
			const { left, top, width, height } = $e.getBoundingClientRect();
			if (left <= pageX && pageX <= left + width && top <= pageY && pageY <= top + height) {
				_.some(_.keys($e), (key) => {
					if (_.startsWith(key, '__reactInternalInstance$')) {
						const { _currentElement: { _owner: { _currentElement: { props: { model, onMouseUp, parent } } } } } = $e[key];
						onMouseUp(e, model, parent);
						return true;
					}
					return false;
				});
				return true;
			}

			return false;
		});
	}

	@autobind
	onMouseUpOrTouchEndDocument() {
		addMouseUpOrTouchEndListener(document, this.onMouseUpOrTouchEndDocument);
		this.setState({ connecting: false });
	}
}