/**
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number[]}
 */
 const cosineCurvePoints = (ax, ay, bx, by, margin = 10) => {
	const r = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));

	if (r < margin * 2) {
		return [];
	}

	const angle = Math.atan2(by - ay, bx - ax);

	ax = ax + margin * Math.cos(angle);
	ay = ay + margin * Math.sin(angle);
	bx = bx - margin * Math.cos(angle);
	by = by - margin * Math.sin(angle);

	const interval = Math.min(100, Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2)));

	if (interval === 0) {
		return [];
	}

	const dx = (bx - ax) / interval;
	const dy = by - ay;

	if (dx === 0 || dy === 0) {
		return [ax, ay, bx, by];
	}

	const points = [ax, ay];
	const max = interval + 1;

	for (let i = 1; i < max; i += 1) {
		points.push(ax + dx * i, ay + dy * (-Math.cos(Math.PI / interval * i) + 1) / 2);
	}

	return points;
};

export default cosineCurvePoints;