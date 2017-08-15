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

const isTouchDevice = (() => {
	try {
		document.createEvent('TouchEvent');
		return true;
	} catch (err) {
		return false;
	}
})();

/**
 * @param {HTMLElement} $e
 * @param {Function} listener 
 */
export const addMouseDownOrTouchStartListener = ($e, listener) => {
	$e.addEventListener(isTouchDevice ? 'touchstart' : 'mousedown', listener);
};

/**
 * @param {HTMLElement} $e
 * @param {Function} listener 
 */
export const addMouseMoveOrTouchMoveListener = ($e, listener) => {
	$e.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', listener);
};

/**
 * @param {HTMLElement} $e
 * @param {Function} listener 
 */
export const addMouseUpOrTouchEndListener = ($e, listener) => {
	$e.addEventListener(isTouchDevice ? 'touchend' : 'mouseup', listener);
};

/**
 * @param {HTMLElement} $e
 * @param {Function} listener 
 */
export const removeMouseDownOrTouchStartListener = ($e, listener) => {
	$e.removeEventListener(isTouchDevice ? 'touchstart' : 'mousedown', listener);
};

/**
 * @param {HTMLElement} $e
 * @param {Function} listener 
 */
export const removeMouseMoveOrTouchMoveListener = ($e, listener) => {
	$e.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', listener);
};

/**
 * @param {HTMLElement} $e
 * @param {Function} listener 
 */
export const removeMouseUpOrTouchEndListener = ($e, listener) => {
	$e.removeEventListener(isTouchDevice ? 'touchend' : 'mouseup', listener);
};

export const onMouseDownOrTouchStart = isTouchDevice ? 'onTouchStart' : 'onMouseDown';

/**
 * @param {MouseEvent|TouchEvent} e
 */
export const getPosition = (e) => {
	if (isTouchDevice) {
		return e.changedTouches.item(0);
	}

	return e;
};
