const React = require('react');
const _ = require('lodash');
const {PinModel} = require('./block.jsx');
const {Component} = React;

class Link extends Component {
	render() {
		const {points} = Link;
		const {props: {from: [ax, ay], to: [bx, by]}} = this;

		return <polyline points={points(ax, ay, bx, by)} fill='none' strokeWidth={3} stroke='white' />;
	}

	/**
	 * @param {number} _ax
	 * @param {number} _ay
	 * @param {number} _bx
	 * @param {number} _by 
	 * @returns {number[][]}
	 */
	static points(_ax, _ay, _bx, _by) {
		const {RADIUS: radius} = PinModel;
		const _dx = _bx - _ax;
		const _dy = _by - _ay;
		const _dist = Math.sqrt(Math.pow(_dx, 2) + Math.pow(_dy, 2));

		if (_dist < radius * 2) {
			return null;
		}

		const _angle = Math.atan2(_dy, _dx);
		const _cos = Math.cos(_angle);
		const _sin = Math.sin(_angle);
		const [[ax, ay], [bx, by]] = _.map([[_ax, _ay, radius], [_bx, _by, -radius]], ([x, y, r]) => {
			return [x + r * _cos, y + r * _sin];
		});
		const dx = bx - ax;

		if (dx === 0) {
			return [ax, ay, bx, by];
		}

		const dy = by - ay;
		const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dx, 2));
		const {INTERVAL: _interval} = Link;
		const interval = Math.min(_.floor(dist), _interval);
		const length = interval + 1;
		const points = [];

		for (let i = 0; i < length; i += 1) {
			const j = i / interval;
			const x = ax + dx * j;
			const angle = j * Math.PI - Math.PI / 2;
			const y = ay + dy * (Math.sin(angle) + 1) / 2;

			points.push(x);
			points.push(y);
		}

		return points;
	}

	static get INTERVAL() {
		return 100;
	}
}

module.exports = { Link };