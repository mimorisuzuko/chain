const isTouchDevice = (() => {
	try {
		document.createEvent('TouchEvent');
		return true;
	} catch (err) {
		return false;
	}
})();

export default isTouchDevice;
export const nameMouseDownOrTouchStart = isTouchDevice ? 'touchstart' : 'mousedown';
export const onMouseDownOrTouchStart = isTouchDevice ? 'onTouchStart' : 'onMouseDown';
/**
 * @param {MouseEvent|TouchEvent} e
 * @returns {{ clientX: number, clientY: number }}
 */
export const getClientPosition = (e) => {
	const { clientX, clientY, changedTouches } = e;

	if (isTouchDevice) {
		const { clientX, clientY } = changedTouches.item(0);
		return { clientX, clientY };
	}

	return { clientX, clientY };
};