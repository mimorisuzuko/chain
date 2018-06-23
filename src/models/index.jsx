import { Record, List, Map } from 'immutable';
import _ from 'lodash';
import { BLOCK, PIN } from '../constants';
import vars from '../shared/vars.scss';

const { white0, purple0, blue1, yellow0 } = vars;

export class Block extends Record({ id: 0, value: '', x: 0, y: 0, deletable: true, editable: true, type: '', color: white0, changeable: true, outputPins: List(), inputPins: List(), height: 70 }) {
	constructor(args) {
		super(args);

		const { type } = this;
		let options = null;

		switch (type) {
			case BLOCK.TYPE_VIEW:
				options = {
					editable: false,
					deletable: false,
					color: purple0,
					inputPins: this._createPins([white0], PIN.TYPE_INPUT)
				};
				break;
			case BLOCK.TYPE_VALUE:
				options = {
					changeable: false,
					outputPins: this._createPins([purple0], PIN.TYPE_OUTPUT)
				};
				break;
			case BLOCK.TYPE_FUNCTION:
				options = {
					color: blue1,
					inputPins: this._createPins([blue1], PIN.TYPE_INPUT),
					outputPins: this._createPins([purple0], PIN.TYPE_OUTPUT)
				};
				break;
			case BLOCK.TYPE_PROPERTY:
				options = {
					changeable: false,
					color: yellow0,
					inputPins: this._createPins([white0], PIN.TYPE_INPUT),
					outputPins: this._createPins([white0], PIN.TYPE_OUTPUT)
				};
				break;
			case BLOCK.TYPE_OPERATOR:
				options = {
					changeable: false,
					inputPins: this._createPins([white0, white0], PIN.TYPE_INPUT),
					outputPins: this._createPins([white0], PIN.TYPE_OUTPUT)
				};
				break;
			default:
				throw new Error(`Unknown type: ${type}.`);
		}

		return this.merge(options).recalculateHeight();
	}

	recalculateHeight() {
		const { inputPins: { size: size0 }, outputPins: { size: size1 } } = this;

		return this.set('height', Math.max(4, size0 + 1, size1 + 1) * (PIN.RADIUS * 2 + 3) - 1);
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
	 * @param {number} pindex
	 */
	createPin(color, type, pindex = null) {
		const { x, y } = this;
		const key = Block.convertPinTypeToPinKey(type);
		const { size } = this.get(key);
		const index = _.isNull(pindex) ? size : pindex;
		const [cx, cy] = Block._pinPosition(index, type);

		return new Pin({ index, color, type, cx: x + cx, cy: y + cy });
	}

	/**
	 * @param {string[]} colors 
	 * @param {string} type 
	 */
	_createPins(colors, type) {
		const pins = this.get(Block.convertPinTypeToPinKey(type));
		return pins.size === 0 ? List(_.map(colors, (color, i) => this.createPin(color, type, i))) : pins;
	}

	/**
	 * @param {string} type
	 */
	static convertPinTypeToPinKey(type) {
		switch (type) {
			case PIN.TYPE_OUTPUT:
				return 'outputPins';
			case PIN.TYPE_INPUT:
				return 'inputPins';
			default:
				throw new Error('Unknown pin type');
		}
	}

	/**
	 * @param {number} index 
	 * @param {string} direction 
	 */
	static _pinPosition(index, direction) {
		return [
			direction === PIN.TYPE_INPUT ? -PIN.RADIUS - 2 : direction === PIN.TYPE_OUTPUT ? BLOCK.WIDTH + PIN.RADIUS : 0,
			PIN.RADIUS + (PIN.RADIUS * 2 + 3) * index + 1
		];
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
}

export class BlockCreator extends Record({ x: 0, y: 0, visible: false, value: '', selected: BLOCK.TYPE_VALUE }) {

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	show(x, y) {
		return this.merge({
			visible: true,
			x,
			y,
			value: '',
			selected: BLOCK.TYPE_VALUE
		});
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

export class PinLink extends Record({ output: Map({ block: 0, pin: 0 }), input: Map({ block: 0, pin: 0 }) }) {
	constructor(args) {
		_.forEach(['output', 'input'], (key) => {
			if (!_.has(args, key)) { return; }
			args[key] = Map(args[key]);
		});

		super(args);
	}

	hasBlock(id) {
		return _.some(['output', 'input'], (key) => this.getIn([key, 'block']) === id);
	}

	match({ output, input }) {
		return PinLink._matcher(this.get('output'), output) && PinLink._matcher(this.get('input'), input);
	}

	static _matcher(target, query) {
		if (_.isObject(query)) {
			return !_.some(_.toPairs(query), ([k, v]) => !PinLink._matcher(target.get(k), v));
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
