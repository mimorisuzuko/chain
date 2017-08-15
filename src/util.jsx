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
export const getPosition = (e) => {
	const { type, changedTouches } = e;

	if (_.includes(['mousedown', 'mousemove', 'mouseup'], type)) {
		return e;
	} else if (_.includes(['touchstart', 'touchmove', 'touchend'], type)) {
		return changedTouches.item(0);
	}

	throw new Error('Unknown event type');
};