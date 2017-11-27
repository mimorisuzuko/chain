import React, { Component } from 'react';
import { Pin as PinModel } from '../models';
import autobind from 'autobind-decorator';
import _ from 'lodash';

const d = PinModel.RADIUS + 1;

export default class Pin extends Component {
	constructor() {
		super();

		this.state = { enter: false, connecting: false };
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	@autobind
	onMouseDownOrTouchStart(e) {
		const { props: { model, parent, onMouseDownOrTouchStart } } = this;

		onMouseDownOrTouchStart(e, model, parent);
		document.addEventListener('mouseup', this.onMouseUpOrTouchEndDocument);
		document.addEventListener('touchend', this.onMouseUpOrTouchEndDocument);
		this.setState({ connecting: true });
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseup(e) {
		const { props: { model, onMouseUpOrTouchEnd, parent } } = this;

		onMouseUpOrTouchEnd(e, model, parent);
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
						const {
							_currentElement: { _owner: { _currentElement: { props: { model, onMouseUpOrTouchEnd, parent } } } }
						} = $e[key];
						onMouseUpOrTouchEnd(e, model, parent);
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
		document.removeEventListener('mouseup', this.onMouseUpOrTouchEndDocument);
		document.removeEventListener('touchend', this.onMouseUpOrTouchEndDocument);
		this.setState({ connecting: false });
	}

	render() {
		const { props: { model }, state: { enter, connecting } } = this;
		const color = model.get('color');
		const type = model.get('type');

		return (
			<svg
				data-pin
				onMouseDown={this.onMouseDownOrTouchStart}
				onTouchStart={this.onMouseDownOrTouchStart}
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
				}}
			>
				<circle
					cx={d}
					cy={d}
					r={PinModel.S_RADIUS}
					fill={type === PinModel.INPUT ? 'none' : type === PinModel.OUTPUT ? color : 'red'}
					stroke={color}
				/>
				{enter || connecting || model.get('linked') ? <circle cx={d} cy={d} r={PinModel.RADIUS} fill={'none'} stroke={color} /> : null}
			</svg>
		);
	}
}
