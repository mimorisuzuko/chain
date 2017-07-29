import { Record } from 'immutable';

export default class Block extends Record({ id: 0, value: '', x: 0, y: 0, deletable: true, editable: true }) {

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const { x, y } = this;

		return this.merge({ x: x + dx, y: y + dy });
	}
}