import _ from 'lodash';

export const dist = (ax, ay, bx, by) => Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));

/**
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number[]}
 */
export const cosineCurvePoints = (ax, ay, bx, by, margin = 10) => {
	const interval = dist(ax, ay, bx, by);
	if (interval === 0) { return []; }

	const dx = (bx - ax) / interval;
	const dy = by - ay;
	const points = [];

	for (let i = 0; i <= interval; i += 1) {
		const x = ax + dx * i;
		const y = ay + dy * (-Math.cos(Math.PI / interval * i) + 1) / 2;

		if (margin < dist(ax, ay, x, y) && margin < dist(bx, by, x, y)) {
			points.push(x, y);
		}
	}

	return points;
};

/**
 * @param {MouseEvent|TouchEvent} e
 */
export const getMouseOrFirstTouchPosition = (e) => {
	const { type, changedTouches } = e;

	if (_.includes(['mousedown', 'mousemove', 'mouseup'], type)) {
		return e;
	} else if (_.includes(['touchstart', 'touchmove', 'touchend'], type)) {
		return changedTouches.item(0);
	}

	throw new Error('Unknown event type');
};

export const generator = new (class IDGenerator {
	static get ZEROS_42() {
		return '000000000000000000000000000000000000000000';
	}

	static get ZEROS_12() {
		return '000000000000';
	}

	constructor() {
		this.sequence = 0;
		this.ptime = 0;
	}

	/**
	 * @returns {number}
	 */
	id() {
		const t = Date.now();

		if (t === this.ptime) {
			this.sequence += 1;
		} else {
			this.sequence = 0;
		}

		const a = (IDGenerator.ZEROS_42 + (t - 1288834974657).toString(2)).slice(-42);
		const b = (IDGenerator.ZEROS_12 + this.sequence.toString(2)).slice(-12);

		return _.parseInt(`${a}${b}`, 2);
	}
});
