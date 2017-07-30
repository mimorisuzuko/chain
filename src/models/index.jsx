import { Record, List } from 'immutable';
import _ from 'lodash';
import { white, purple, blue, yellow } from '../color';

const VALUE_BLOCK = 'VALUE_BLOCK';
const FUNCTION_BLOCK = 'FUNCTION_BLOCK';
const PROPERTY_BLOCK = 'PROPERTY_BLOCK';
const OPERATOR_BLCOK = 'OPERATOR_BLCOK';
const CREATABLE_TYPES = { VALUE_BLOCK, FUNCTION_BLOCK, PROPERTY_BLOCK, OPERATOR_BLCOK };
const CREATABLE_TYPE_KEYS = _.keys(CREATABLE_TYPES);

/**
 * @param {string[]} colors
 * @param {string} type
 */
const createPins = (colors, type) => List(_.map(colors, (color, index) => new Pin({ index, color, type })));

export class Block extends Record({ id: 0, value: '', x: 0, y: 0, deletable: true, editable: true, type: '', color: white, changeable: true, rightPins: List(), leftPins: List() }) {
	constructor(args) {
		switch (args.type) {
			case BlockCreator.VIEW_BLOCK:
				args.editable = false;
				args.deletable = false;
				args.color = purple;
				args.leftPins = createPins([white], Pin.INPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.VALUE_BLOCK:
				args.changeable = false;
				args.rightPins = createPins([purple], Pin.OUTPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.FUNCTION_BLOCK:
				args.color = blue;
				args.leftPins = createPins([blue], Pin.INPUT);
				args.rightPins = createPins([purple], Pin.OUTPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.PROPERTY_BLOCK:
				args.changeable = false;
				args.color = yellow;
				args.leftPins = createPins([white], Pin.INPUT);
				args.rightPins = createPins([white], Pin.OUTPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.OPERATOR_BLCOK:
				args.changeable = false;
				args.leftPins = createPins([white, white], Pin.INPUT);
				args.rightPins = createPins([white], Pin.OUTPUT);
				break;
			default:
				break;
		}

		super(args);
	}

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const { x, y } = this;

		return this.merge({ x: x + dx, y: y + dy });
	}
}

export class Pin extends Record({ index: 0, color: white, type: '' }) {
	static get OUTPUT() {
		return 'OUTPUT_PIN';
	}

	static get INPUT() {
		return 'INPUT_PIN';
	}
}

export class BlockCreator extends Record({ x: 0, y: 0, visible: false, value: '', selected: CREATABLE_TYPE_KEYS[0], rightPins: List(), leftPins: List() }) {

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

export class PinLink extends Record({ output: { block: 0, pin: 0 }, input: { block: 0, pin: 0 } }) { }