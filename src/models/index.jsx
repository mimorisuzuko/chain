import { Record, List } from 'immutable';
import _ from 'lodash';
import colors from '../shared/vars.scss';

const { white0, purple0, blue1, yellow0 } = colors;
const VALUE_BLOCK = 'VALUE_BLOCK';
const FUNCTION_BLOCK = 'FUNCTION_BLOCK';
const PROPERTY_BLOCK = 'PROPERTY_BLOCK';
const OPERATOR_BLCOK = 'OPERATOR_BLCOK';
const CREATABLE_TYPES = { VALUE_BLOCK, FUNCTION_BLOCK, PROPERTY_BLOCK, OPERATOR_BLCOK };
const CREATABLE_TYPE_KEYS = _.keys(CREATABLE_TYPES);

export class Block extends Record({ id: 0, value: '', x: 0, y: 0, deletable: true, editable: true, type: '', color: white0, changeable: true, outputPins: List(), inputPins: List() }) {
	constructor(args) {
		super(args);

		switch (this.type) {
			case BlockCreator.VIEW_BLOCK:
				return this.merge({
					editable: false,
					deletable: false,
					color: purple0,
					inputPins: this._createPins([white0], Pin.INPUT)
				});
			case BlockCreator.CREATABLE_TYPES.VALUE_BLOCK:
				return this.merge({
					changeable: false,
					outputPins: this._createPins([purple0], Pin.OUTPUT)
				});
				break;
			case BlockCreator.CREATABLE_TYPES.FUNCTION_BLOCK:
				return this.merge({
					color: blue1,
					inputPins: this._createPins([blue1], Pin.INPUT),
					outputPins: this._createPins([purple0], Pin.OUTPUT)
				});
			case BlockCreator.CREATABLE_TYPES.PROPERTY_BLOCK:
				return this.merge({
					changeable: false,
					color: yellow0,
					inputPins: this._createPins([white0], Pin.INPUT),
					outputPins: this._createPins([white0], Pin.OUTPUT)
				});
			case BlockCreator.CREATABLE_TYPES.OPERATOR_BLCOK:
				return this.merge({
					changeable: false,
					inputPins: this._createPins([white0, white0], Pin.INPUT),
					outputPins: this._createPins([white0], Pin.OUTPUT)
				});
			default:
				break;
		}
	}

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const { x, y, inputPins, outputPins } = this;

		return this.merge({
			x: x + dx,
			y: y + dy,
			inputPins: inputPins.map((a) => a.dmove(dx, dy)),
			outputPins: outputPins.map((a) => a.dmove(dx, dy))
		});
	}

	/**
	 * @param {string} color
	 * @param {string} type
	 * @param {number} index
	 */
	createPin(color, type, index = null) {
		const { x, y } = this;
		const key = type === Pin.OUTPUT ? 'outputPins' : type === Pin.INPUT ? 'inputPins' : 'unknownPins';
		const { size } = this.get(key);
		const [cx, cy] = Block._pinPosition(index, type);

		return new Pin({ index: _.isNull(index) ? size : index, color, type, cx: x + cx, cy: y + cy });
	}

	/**
	 * @param {string[]} colors 
	 * @param {string} type 
	 */
	_createPins(colors, type) {
		return List(_.map(colors, (color, i) => this.createPin(color, type, i)));
	}

	/**
	 * @param {number} index 
	 * @param {string} direction 
	 */
	static _pinPosition(index, direction) {
		return [
			direction === Pin.INPUT ? -Pin.RADIUS - 2 : direction === Pin.OUTPUT ? Block.WIDTH + Pin.RADIUS : 0,
			Pin.RADIUS + (Pin.RADIUS * 2 + 3) * index
		];
	}

	static get WIDTH() {
		return 200;
	}
}

export class Pin extends Record({ index: 0, color: white0, type: '', linked: false, cx: 0, cy: 0 }) {
	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const { cx, cy } = this;

		return this.merge({ cx: cx + dx, cy: cy + dy });
	}

	static get OUTPUT() {
		return 'OUTPUT_PIN';
	}

	static get INPUT() {
		return 'INPUT_PIN';
	}

	static get RADIUS() {
		return 7;
	}

	static get S_RADIUS() {
		return 4;
	}
}

export class BlockCreator extends Record({ x: 0, y: 0, visible: false, value: '', selected: CREATABLE_TYPE_KEYS[0] }) {

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	toggle(x, y) {
		const { visible } = this;

		return !visible ? this.merge({ x, y, visible: true, value: '', selected: CREATABLE_TYPE_KEYS[0] }) : this.set('visible', false);
	}

	static get CREATABLE_TYPES() {
		return CREATABLE_TYPES;
	}

	static get CREATABLE_TYPE_KEYS() {
		return CREATABLE_TYPE_KEYS;
	}

	static get VIEW_BLOCK() {
		return 'VIEW_BLOCK';
	}
}

export class PointLink extends Record({ ax: 0, ay: 0, bx: 0, by: 0 }) {
	start(x, y) {
		return this.merge({ ax: x, ay: y, bx: x, by: y });
	}

	end(x, y) {
		return this.merge({ bx: x, by: y });
	}

	points() {
		const { ax, ay, bx, by } = this;

		return [ax, ay, bx, by];
	}
}

export class PinLink extends Record({ output: { block: 0, pin: 0 }, input: { block: 0, pin: 0 } }) {
	hasBlock(id) {
		return this.get('output').block === id || this.get('input').block === id;
	}

	match(query) {
		return PinLink._matcher(this.get('output'), query.output) && PinLink._matcher(this.get('input'), query.input);
	}

	static _matcher(target, query) {
		if (_.isObject(query)) {
			return !_.some(_.toPairs(query), ([k, v]) => !PinLink._matcher(target[k], v));
		}

		if (target === undefined) {
			return false;
		}

		if (query === undefined) {
			return true;
		}

		return target === query;
	}
}

export class Balloon extends Record({ id: 0, value: '', life: 100 }) {
	nlife() {
		return this.life / Balloon.MAX_LIFE;
	}

	static get MAX_LIFE() {
		return 100;
	}
}