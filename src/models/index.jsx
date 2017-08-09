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

export class Block extends Record({ id: 0, value: '', x: 0, y: 0, deletable: true, editable: true, type: '', color: white, changeable: true, outputPins: List(), inputPins: List() }) {
	constructor(args) {
		switch (args.type) {
			case BlockCreator.VIEW_BLOCK:
				args.editable = false;
				args.deletable = false;
				args.color = purple;
				args.inputPins = createPins([white], Pin.INPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.VALUE_BLOCK:
				args.changeable = false;
				args.outputPins = createPins([purple], Pin.OUTPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.FUNCTION_BLOCK:
				args.color = blue;
				args.inputPins = createPins([blue], Pin.INPUT);
				args.outputPins = createPins([purple], Pin.OUTPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.PROPERTY_BLOCK:
				args.changeable = false;
				args.color = yellow;
				args.inputPins = createPins([white], Pin.INPUT);
				args.outputPins = createPins([white], Pin.OUTPUT);
				break;
			case BlockCreator.CREATABLE_TYPES.OPERATOR_BLCOK:
				args.changeable = false;
				args.inputPins = createPins([white, white], Pin.INPUT);
				args.outputPins = createPins([white], Pin.OUTPUT);
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

		if(query === undefined){
			return true;
		}

		return target === query;
	}
}