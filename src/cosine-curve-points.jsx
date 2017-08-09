const dist = (ax, ay, bx, by) => Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));

/**
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number[]}
 */
const cosineCurvePoints = (ax, ay, bx, by, margin = 10) => {
	ax += 1;
	ay += 1;
	let interval = dist(ax, ay, bx, by);
	let index = 1;
	let add = false;
	const dx = (bx - ax) / interval;
	const dy = by - ay;
	const points = [];

	for (index; index <= interval; index += 1) {
		const x = ax + dx * index;
		const y = ay + dy * (-Math.cos(Math.PI / interval * index) + 1) / 2;

		if (!add && margin < dist(ax, ay, x, y)) {
			add = true;
			interval -= index;
			points.push(x, y);
		} else if (add) {
			points.push(x, y);
		}
	}

	return points;
};

export default cosineCurvePoints;