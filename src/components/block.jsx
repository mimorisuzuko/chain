const React = require('react');
const Immutable = require('immutable');
const Radium = require('radium');
const _ = require('lodash');
const { black, white, lblack, red, vblue, vlblue, vpink, vyellow } = require('../color');
const { Record, List } = Immutable;
const { Component, PropTypes } = React;

class PinModel extends Record({ type: 0, index: 0, color: white, dst: null, cx: 0, cy: 0 }) {
	/**
	 * @param {Object} o
	 */
	constructor(o) {
		const { type } = o;

		if (type === 0) {
			super(_.assign(o, { dst: 0 }));
		} else {
			super(_.assign(o, { dst: null }));
		}
	}

	/**
	 * @param {string} id
	 */
	connect(id) {
		const { type, dst } = this;

		if (type === 0) {
			return this.set('dst', dst + 1);
		}

		return this.set('dst', id);
	}

	disconnect() {
		const { type, dst } = this;

		if (type === 0) {
			return this.set('dst', dst - 1);
		}

		return this.set('dst', null);
	}

	connected() {
		const { type, dst } = this;

		return type === 0 ? dst > 0 : dst;
	}

	static get RADIUS() {
		return 8;
	}

	static get S_RADIUS() {
		return 4;
	}
}

class Pin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isMouseHover: false,
			isConnecting: false
		};
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseUpDocument = this.onMouseUpDocument.bind(this);
	}

	render() {
		const {
			state: { isMouseHover, isConnecting },
			context: { isTouch }
		} = this;
		const { props: { model } } = this;
		const { RADIUS: r, S_RADIUS: sr } = PinModel;
		const width = r * 2;
		const color = model.get('color');
		const outline = isMouseHover || isConnecting || model.connected() ? <circle strokeWidth={1} stroke={color} cx={r} cy={r} r={r - 1} fill='none' /> : null;
		const events = isTouch ?
			{
				onTouchStart: this.onMouseDown,
				onTouchEnd: this.onMouseUp
			} : {
				onMouseDown: this.onMouseDown,
				onMouseUp: this.onMouseUp,
				onMouseEnter: this.onMouseEnter,
				onMouseLeave: this.onMouseLeave
			};

		return (
			<svg
				{...events}
				style={{
					display: 'block',
					width,
					height: width,
					position: 'absolute',
					left: model.get('cx') - r,
					top: model.get('cy') - r,
					cursor: 'pointer'
				}}>
				<circle strokeWidth={1} stroke={color} cx={r} cy={r} r={sr} fill={model.get('type') ? 'none' : color} />
				{outline}
			</svg>
		);
	}

	onMouseDown() {
		const {
			props: { parent, model, onConnectStart },
			context: { isTouch }
		} = this;

		if (isTouch) {
			document.addEventListener('touchend', this.onMouseUpDocument);
		} else {
			document.addEventListener('mouseup', this.onMouseUpDocument);
		}

		onConnectStart(parent, model);
		this.setState({ isConnecting: true });
	}

	onMouseUpDocument() {
		const { context: { isTouch } } = this;

		if (isTouch) {
			document.removeEventListener('touchend', this.onMouseUpDocument);
		} else {
			document.removeEventListener('mouseup', this.onMouseUpDocument);
		}

		this.setState({ isConnecting: false });
	}

	onMouseUp() {
		const { props: { parent, model, onConnectEnd } } = this;

		onConnectEnd(parent, model);
	}

	onMouseEnter() {
		this.setState({ isMouseHover: true });
	}

	onMouseLeave() {
		this.setState({ isMouseHover: false });
	}

	static get contextTypes() {
		return { isTouch: PropTypes.bool };
	}
}

const BLOCK_LIST = {
	window: {
		value: '',
		editablevalue: false,
		inputPinsMinlength: 1,
		inputPins: [{}],
		color: vpink,
		width: 270,
		deletable: false
	},
	value: {
		editablepin: false,
		outputPins: [{ color: vpink }],
		color: vlblue
	},
	function: {
		inputPinsMinlength: 1,
		outputPins: [{}],
		inputPins: [{ color: vblue }],
		color: vblue,
		addedPinColor: vlblue
	},
	property: {
		outputPins: [{}],
		inputPins: [{}],
		editablepin: false,
		color: vyellow
	},
	operator: {
		inputPinsMinlength: 2,
		outputPins: [{}],
		inputPins: [{}, {}],
	},
	debug: {
		value: '"Hello, World!"',
		outputPins: [{}],
		inputPins: [{}]
	}
};

_.forEach(Object.keys(BLOCK_LIST), (a) => {
	const b = BLOCK_LIST[a];

	_.forEach(['outputPins', 'inputPins'], (c, type) => {
		if (!_.has(b, c)) { return; }
		b[c] = List(_.map(b[c], (d, index) => new PinModel(_.assign({ type, index }, d))));
	});

	BLOCK_LIST[a] = b;
});

class BlockModel extends Record({
	id: '',
	name: '',
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	value: '',
	inputPinsMinlength: 0,
	outputPinsMinlength: 0,
	inputPins: List(),
	outputPins: List(),
	editablepin: true,
	editablevalue: true,
	deletable: true,
	color: white,
	addedPinColor: white
}) {

	/**
	 * @param {Object} o
	 */
	constructor(o) {
		const { BLOCK_LIST: list, MIN_HEIGHT: height, WIDTH: width } = BlockModel;
		const id = `block${Date.now()}`;
		const { name } = o;
		const block = super(_.assign({ id, name, height, width }, o, list[name]));

		return block.update('inputPins', (a) => a.map((b, i) => {
			const [cx, cy] = this.pinPosition(1, i);

			return b.merge({ cx, cy });
		})).update('outputPins', (a) => a.map((b, i) => {
			const [cx, cy] = this.pinPosition(0, i);

			return b.merge({ cx, cy });
		}));
	}

	isTail() {
		const { outputPins } = this;
		const { size } = outputPins;

		return size === 0 || !outputPins.get(0).connected();
	}

	addInputPin() {
		const { addedPinColor: color, inputPins: { size } } = this;
		const height = Math.max(BlockModel.MIN_HEIGHT, (size + 2) * (PinModel.RADIUS * 2));

		return this.set('height', height).update('inputPins', (pins) => {
			const { size: index } = pins;
			const [cx, cy] = this.pinPosition(1, index);

			return pins.push(new PinModel({ type: 1, index, color, cx, cy }));
		});
	}

	removeInputPin() {
		const { inputPins: { size }, inputPinsMinlength: min } = this;
		const height = Math.max(BlockModel.MIN_HEIGHT, size * (PinModel.RADIUS * 2));

		return min < size ? this.set('height', height).update('inputPins', (pins) => pins.pop()) : this;
	}

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const { x, y } = this;

		return this.merge({ x: x + dx, y: y + dy });
	}

	/**
	 * @param {PinModel} pin
	 * @returns {number[]}
	 */
	absolutePositionOf(pin) {
		const { x, y } = this;

		return [x + pin.get('cx'), y + pin.get('cy')];
	}

	/**
	 * @param {number} type
	 * @param {number} index 
	 * @returns {number[]}
	 */
	pinPosition(type, index) {
		const { width } = this;
		const { RADIUS: r } = PinModel;
		const d = r * 2;

		if (type === 0) {
			return [width + r, d * index + r - 1];
		} else if (type === 1) {
			return [-r - 1, d * index + r - 1];
		}

		return [0, 0];
	}

	static get BLOCK_LIST() {
		return BLOCK_LIST;
	}

	static get WIDTH() {
		return 180;
	}

	static get MIN_HEIGHT() {
		return 64;
	}
}

class Button extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	render() {
		const { props: { value, backgroundColor } } = this;

		return (
			<a href='#' onClick={this.onClick} style={{
				padding: '1px 8px',
				backgroundColor,
				marginRight: 1,
				display: 'inline-block'
			}}>
				{value}
			</a>
		);
	}

	onClick() {
		const { props: { onClick } } = this;

		onClick();
	}
}

const Textarea = Radium(class Textarea extends Component {
	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
	}

	render() {
		const { props: { value, editable, color } } = this;

		return (
			<textarea disabled={!editable} value={value} onChange={this.onChange} style={{
				display: 'block',
				outline: 'none',
				backgroundColor: lblack,
				width: '100%',
				height: '100%',
				boxSizing: 'border-box',
				borderLeft: 'none',
				borderTopWidth: 1,
				borderTopColor: 'transparent',
				borderTopStyle: 'solid',
				borderRightWidth: 1,
				borderRightColor: 'transparent',
				borderRightStyle: 'solid',
				borderBottomWidth: 1,
				borderBottomColor: 'transparent',
				borderBottomStyle: 'solid',
				':focus': {
					borderTopColor: color,
					borderRightColor: color,
					borderBottomColor: color
				}
			}} />
		);
	}

	/**
	 * @param {Event} e
	 */
	onChange(e) {
		const { props: { onChange } } = this;

		onChange(e);
	}
});

class Block extends Component {
	constructor(props) {
		super(props);

		this.px = 0;
		this.py = 0;
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onChangeTextarea = this.onChangeTextarea.bind(this);
		this.removeInputPin = this.removeInputPin.bind(this);
		this.addInputPin = this.addInputPin.bind(this);
		this.onMouseMoveDocument = this.onMouseMoveDocument.bind(this);
		this.onMouseUpDocument = this.onMouseUpDocument.bind(this);
		this.remove = this.remove.bind(this);
	}

	render() {
		const {
			props: { model, onConnectPinStart, onConnectPinEnd },
			context: { isTouch }
		} = this;
		const color = model.get('color');
		const height = model.get('height');
		const pins = _.map(['inputPins', 'outputPins'], (name) => model.get(name).map((a) => <Pin model={a} parent={model} onConnectStart={onConnectPinStart} onConnectEnd={onConnectPinEnd} />));
		const events = isTouch ? { onTouchStart: this.onMouseDown } : { onMouseDown: this.onMouseDown };

		return (
			<div data-movable={true} {...events} style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				width: model.get('width'),
				border: `1px solid ${lblack}`,
				backgroundColor: black,
				height,
				boxSizing: 'border-box',
				boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)'
			}}>
				<div data-movable={true}>
					{model.get('deletable') ? <Button value='×' backgroundColor={red} onClick={this.remove} /> : null}
					{model.get('editablepin') ? [
						<Button value='-' backgroundColor={lblack} onClick={this.removeInputPin} />,
						<Button value='+' backgroundColor={lblack} onClick={this.addInputPin} />
					] : null}
				</div>
				<div data-movable={true} style={{
					borderLeft: `5px solid ${color}`,
					height: height - 16 - 12,
					margin: 5
				}}>
					<Textarea color={color} value={model.get('value')} onChange={this.onChangeTextarea} editable={model.get('editablevalue')} />
				</div>
				{pins}
			</div>
		);
	}

	remove() {
		const { props: { model, remove } } = this;

		remove(model);
	}

	removeInputPin() {
		const { props: { model, update } } = this;

		update(model.removeInputPin(), true);
	}

	addInputPin() {
		const { props: { model, update } } = this;

		update(model.addInputPin());
	}

	/**
	 * @param {Event} e
	 */
	onChangeTextarea(e) {
		const { props: { model, update } } = this;
		const { currentTarget: { value } } = e;

		update(model.set('value', value));
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 * @returns {number[]}
	 */
	mouse(e) {
		const { context: { isTouch } } = this;

		if (isTouch) {
			const { clientX, clientY } = e.touches.item(0);

			return [clientX, clientY];
		}

		const { clientX, clientY } = e;

		return [clientX, clientY];
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	onMouseDown(e) {
		const { context: { isTouch } } = this;
		const { target: { dataset: { movable } } } = e;

		if (!Boolean(movable)) { return; }
		const [x, y] = this.mouse(e);

		if (isTouch) {
			document.addEventListener('touchmove', this.onMouseMoveDocument);
			document.addEventListener('touchend', this.onMouseUpDocument);
		} else {
			document.body.classList.add('cursor-move');
			document.addEventListener('mousemove', this.onMouseMoveDocument);
			document.addEventListener('mouseup', this.onMouseUpDocument);
		}

		this.px = x;
		this.py = y;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	onMouseMoveDocument(e) {
		const { props: { model, update }, px, py } = this;
		const [x, y] = this.mouse(e);
		const dx = x - px;
		const dy = y - py;

		update(model.dmove(dx, dy));
		this.px = x;
		this.py = y;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseUpDocument() {
		const { context: { isTouch } } = this;

		if (isTouch) {
			document.removeEventListener('touchmove', this.onMouseMoveDocument);
			document.removeEventListener('touchend', this.onMouseUpDocument);
		} else {
			document.body.classList.remove('cursor-move');
			document.removeEventListener('mousemove', this.onMouseMoveDocument);
			document.removeEventListener('mouseup', this.onMouseUpDocument);
		}
	}

	static get contextTypes() {
		return { isTouch: PropTypes.bool };
	}
}

module.exports = { Block, BlockModel, Pin, PinModel };