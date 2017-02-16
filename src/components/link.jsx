const React = require('react');
const _ = require('lodash');
const Immutable = require('immutable');
const {PinModel} = require('./block.jsx');
const {Component} = React;
const {Record} = Immutable;

class LinkModel extends Record({ ax: 0, ay: 0, bx: 0, by: 0, visible: false }) {

	/**
	 * @param {number} ax
	 * @param {number} ay
	 */
	start(ax, ay) {
		return this.merge({ ax, ay, bx: ax, by: ay, visible: true });
	}

	/**
	 * @param {number} bx
	 * @param {number} by
	 */
	end(bx, by) {
		return this.merge({ bx, by });
	}

	points() {
		const {points} = LinkModel;
		const {ax, ay, bx, by} = this;

		return points(ax, ay, bx, by);
	}

	/**
	 * @param {number} _ax
	 * @param {number} _ay
	 * @param {number} _bx
	 * @param {number} _by 
	 * @returns {number[]}
	 */
	static points(_ax, _ay, _bx, _by) {
		const {RADIUS: _radius} = PinModel;
		const radius = _radius;
		const _dx = _bx - _ax;
		const _dy = _by - _ay;
		const _dist = Math.sqrt(Math.pow(_dx, 2) + Math.pow(_dy, 2));

		if (_dist < radius * 2 + 2) {
			return null;
		}

		const _angle = Math.atan2(_dy, _dx);
		const _cos = Math.cos(_angle);
		const _sin = Math.sin(_angle);
		const [[ax, ay], [bx, by]] = _.map([[_ax, _ay, radius + 2], [_bx, _by, -radius]], ([x, y, r]) => {
			return [x + r * _cos, y + r * _sin];
		});
		const dx = bx - ax;

		if (dx === 0) {
			return [ax, ay, bx, by];
		}

		const dy = by - ay;
		const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		const {INTERVAL: _interval} = LinkModel;
		const interval = Math.min(_.floor(dist), _interval);

		if (interval === 0) {
			return null;
		}

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

class Link extends Component {
	render() {
		const {polyline} = Link;
		const {points} = LinkModel;
		const {props: {model, pintopin}} = this;

		if (pintopin) {
			const [[ax, ay], [bx, by]] = pintopin;
			return polyline(points(ax, ay, bx, by));
		} else if (model) {
			return model.get('visible') ? polyline(model.points()) : null;
		}

		return null;
	}

	/**
	 * @param {number[]} points
	 */
	static polyline(points) {
		return <polyline points={points} fill='none' strokeWidth={3} stroke='white' />;
	}
}

module.exports = { Link, LinkModel };