'use strict';

const ChainColor = {
	blue: 'rgb(86, 156, 214)',
	clear: 'rgba(0, 0, 0, 0)',
	gray: 'rgb(37, 37, 38)',
	lightgray: 'rgb(51, 51, 51)',
	white: 'rgb(212, 212, 212)',
	purple: 'rgb(197, 134, 192)',
	green: 'rgb(78, 201, 176)',
	red: 'rgb(252, 70, 66)'
};

class ChainChild {
	/**
	 * @param {Chain} chain
	 */
	constructor(chain) {
		this.chain = chain;
		this.context = this.chain.context;
		this.fillStyle = ChainColor.clear;
		this.strokeStyle = ChainColor.clear;
		this.lineWidth = 1;
		this.font = "12px 'Menlo'";
		this.textBaseline = 'top';
		this.textAlign = 'left';
	}

	draw() {
		this.context.fillStyle = this.fillStyle;
		this.context.strokeStyle = this.strokeStyle;
		this.context.lineWidth = this.lineWidth;
		this.context.font = this.font;
		this.context.textAlign = this.textAlign;
		this.context.textBaseline = this.textBaseline;
	}
}

class ChainChildWithPosition extends ChainChild {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, x = 0, y = 0) {
		super(chain);
		this.x = x;
		this.y = y;
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	position(x, y) {
		this.x = x;
		this.y = y;
	}
}

class ChainText extends ChainChildWithPosition {
	/**
	 * @param {Chain} chain
	 * @param {String} text
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, text = '', x = 0, y = 0) {
		super(chain, x, y);
		this.fillStyle = ChainColor.white;
		this.text = text;
	}

	draw() {
		super.draw();
		this.context.fillText(this.text, this.x, this.y);
	}

	/**
	 * @param {String} horizontal
	 * @param {String} vertical
	 */
	align(horizontal = 'left', vertical = 'top') {
		this.textAlign = horizontal;
		this.textBaseline = vertical;
	}
}

class ChainCircle extends ChainChildWithPosition {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} radius
	 */
	constructor(chain, x = 0, y = 0, radius = 0) {
		super(chain, x, y);
		this.radius = radius;
	}

	draw() {
		super.draw();
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		this.context.closePath();
		this.context.stroke();
		this.context.fill();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {Boolean}
	 */
	contains(x, y) {
		const dx = this.x - x;
		const dy = this.y - y;
		return dx * dx + dy * dy < this.radius * this.radius;
	}

	/**
	 * @param {Number} radius
	 */
	size(radius) {
		this.radius = radius;
	}
}

class ChainOutlineCircle extends ChainCircle {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} radius
	 */
	constructor(chain, x = 0, y = 0, radius = 0) {
		super(chain, x, y, radius);
		this.lineWidth = 2;
		this.center = new ChainCircle(chain);
		this.outline = true;
		this.color = ChainColor.white;
		this.adjustCenter();
	}

	draw() {
		if (this.outline) {
			super.draw();
		}
		this.center.draw();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	position(x, y) {
		super.position(x, y);
		this.adjustCenter();
	}

	/**
	 * @param {Number} radius
	 */
	size(radius) {
		super.size(radius);
		this.adjustCenter();
	}

	/**
	 * adjust position and radius of center circle
	 */
	adjustCenter() {
		this.center.position(this.x, this.y);
		this.center.size(this.radius / 1.7);
	}

	set color(color) {
		this.strokeStyle = color;
		this.center.fillStyle = color;
	}
}

class ChainCosLine extends ChainChild {
	/**
	 * @param {Chain} chain
	 */
	constructor(chain, ax = 0, ay = 0, bx = 0, by = 0) {
		super(chain);
		this.ax = ax;
		this.ay = ay;
		this.bx = bx;
		this.by = by;
		this.points = [];
		this.update();
	}

	draw() {
		super.draw();
		this.context.beginPath();
		this.points.forEach((point, i) => {
			this.context[(i === 0) ? 'moveTo' : 'lineTo'](point[0], point[1]);
		});
		this.context.stroke();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	begin(x, y) {
		this.ax = x;
		this.ay = y;
		this.update();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	end(x, y) {
		this.bx = x;
		this.by = y;
		this.update();
	}

	/**
	 * update points
	 */
	update() {
		this.points = [[this.ax, this.ay]];
		const w = this.bx - this.ax;
		const h = this.by - this.ay;
		const d = Math.sqrt(w * w + h * h);
		for (let i = 1; i < d + 1; i++) {
			const rate = i / d;
			const x = this.ax + w * rate;
			const y = this.ay + h * (1 + Math.cos(Math.PI - Math.PI * rate)) / 2;
			this.points.push([x, y]);
		}
	}
}

class ChainRope extends ChainCosLine {
	/**
	 * @param {Chain} chain
	 */
	constructor(chain) {
		super(chain);
		this.lineWidth = 3;
		this.color = ChainColor.green;
	}

	/**
	 * update points
	 */
	update() {
		this.points = [[]];
		const w = this.bx - this.ax;
		const h = this.by - this.ay;
		const d = Math.sqrt(w * w + h * h);
		const dt = (ChainPin.RADIUS + 2) * (ChainPin.RADIUS + 2);
		for (let i = 0; i < d + 1; i++) {
			const rate = i / d;
			const x = this.ax + w * rate;
			const y = this.ay + h * (1 + Math.cos(Math.PI - Math.PI * rate)) / 2;
			const da = (this.ax - x) * (this.ax - x) + (this.ay - y) * (this.ay - y);
			const db = (this.bx - x) * (this.bx - x) + (this.by - y) * (this.by - y);
			if (da < dt || db < dt) {
				continue;
			}
			this.points.push([x, y]);
		}
	}

	/**
	 * @param {String} color
	 */
	set color(color) {
		this.strokeStyle = color;
	}
}

class ChainBox extends ChainChildWithPosition {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	constructor(chain, x = 0, y = 0, width = 0, height = 0) {
		super(chain, x, y);
		this.width = width;
		this.height = height;
	}

	draw() {
		super.draw();
		this.context.beginPath();
		this.context.rect(this.x, this.y, this.width, this.height);
		this.context.closePath();
		this.context.stroke();
		this.context.fill();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {Boolean}
	 */
	contains(x, y) {
		return this.x < x && x < this.x + this.width && this.y < y && y < this.y + this.height;
	}

	/**
	 * @param {Number} width
	 * @param {Number} height
	 */
	size(width, height) {
		this.width = width;
		this.height = height;
	}
}

class ChainButton extends ChainBox {
	/**
	 * @param {Chain} chain
	 * @param {String} text
	 * @param {Function} clicker
	 */
	constructor(chain, text = '', click = () => { }) {
		super(chain);
		this.fillStyle = ChainColor.lightgray;
		this.text = new ChainText(this.chain, text);
		this.text.align('center', 'middle');
		this.size(this.context.measureText(text).width + Chain.PAD * 2, Chain.PAD * 2);
		this.click = click

		this.adjustText();
	}

	draw() {
		super.draw();
		this.text.draw();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	position(x, y) {
		super.position(x, y);
		this.adjustText();
	}

	/**
	 * @param {Number} width
	 * @param {Number} height
	 */
	size(width, height) {
		super.size(width, height);
		this.adjustText();
	}

	adjustText() {
		this.text.position(this.x + this.width / 2, this.y + this.height / 2);
	}
}

class ChainBlock extends ChainBox {
	/**
	 * @param {Chain} chain
	 * @param {String} id
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	constructor(chain, id = '', x = 0, y = 0, width = 200, height = 50) {
		super(chain, x, y, width, height);
		this.strokeStyle = ChainColor.lightgray;
		this.fillStyle = ChainColor.gray;
		this.id = new ChainText(this.chain, id);
		this.id.align('left', 'middle');
		this.adjustWidth(100);
		this.pins = [];
		const close = new ChainButton(this.chain, '×', () => {
			this.chain.displayedBlocks = this.chain.displayedBlocks.filter((a) => a !== this);
			this.pins.forEach((a) => this.chain.deleteLink(a));
		});
		close.fillStyle = ChainColor.red;
		this.buttons = [close];
	}

	draw() {
		super.draw();
		this.id.draw();
		this.pins.forEach((a) => a.draw());
		this.buttons.forEach((a) => a.draw());
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	position(x, y) {
		super.position(x, y);
		this.adjustChildren();
	}

	/**
	 * @param {Number} width
	 * @param {Number} height
	 */
	size(width, height) {
		super.size(width, height);
		this.adjustChildren();
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {ChainOutlineCircle}
	 */
	getPinContains(x, y) {
		const pin = this.pins.filter((a) => a.contains(x, y))[0];
		return pin;
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {ChainButton}
	 */
	getButtonContains(x, y) {
		const button = this.buttons.filter((a) => a.contains(x, y))[0];
		return button;
	}

	/**
	 * @param {Number} minWidth
	 */
	adjustWidth(minWidth) {
		this.width = Math.max(minWidth, this.context.measureText(this.id.text).width + Chain.PAD * 2);
	}

	adjustChildren() {
		this.id.position(this.x + Chain.PAD, this.y + this.height / 2);
		let dw = 0;
		this.buttons.forEach((button) => {
			button.position(this.x + this.width - button.width - dw, this.y);
			dw += button.width + 1;
		});
	}

	set value(value) {
		this.id.text = value;
	}

	get value() {
		return this.id.text;
	}
}

class ChainLink extends ChainRope {
	/**
	 * @param {Chain} chain
	 * @param {ChainPin} beginPin
	 * @param {ChainPin} endPin
	 */
	constructor(chain, beginPin, endPin) {
		super(chain);
		beginPin.linked = true;
		endPin.linked = true;
		this.linkedPins = [];
		this.begin(beginPin);
		this.end(endPin);
	}

	draw() {
		this.begin(this.linkedPins[0]);
		this.end(this.linkedPins[1]);
		super.draw();
	}

	/**
	 * @param {ChainPin} pin
	 */
	begin(pin) {
		this.linkedPins[0] = pin;
		super.begin(this.linkedPins[0].x, this.linkedPins[0].y);
	}

	/**
	 * @param {ChainPin} pin
	 */
	end(pin) {
		this.linkedPins[1] = pin;
		super.end(this.linkedPins[1].x, this.linkedPins[1].y);
	}
}

class ChainPin extends ChainOutlineCircle {
	/**
	 * @param {Chain} chain
	 * @param {ChainBlock} parent
	 * @param {Number} type
	 * @param {Function} sender
	 */
	constructor(chain, parent, type, sender) {
		super(chain, 0, 0, ChainPin.RADIUS);
		this.parent = parent;
		this.type = type;
		this.sender = sender;
		this.value = null;
		this.toPins = [];
		this.linked = false;
	}

	draw() {
		this.outline = this.contains(this.chain.mousex, this.chain.mousey) || this.linked;
		super.draw();
	}

	/**
	 * relative position by parent
	 * @param {Number} x
	 * @param {Number} y
	 */
	position(x, y) {
		super.position(this.parent.x + x, this.parent.y + y);
	}

	/**
	 * @param {ChainPin} targetPin
	 */
	addLink(targetPin) {
		this.toPins.push(targetPin);
	}

	/**
	 * @param {ChainPin} targetPin
	 */
	deleteLink(targetPin) {
		this.toPins = this.toPins.filter((a) => a !== targetPin);
		if (this.toPins.length === 0) {
			this.linked = false;
		}
	}

	send() {
		this.toPins.forEach((pin) => {
			pin.value = this.sender();
		});
	}

	static get OUTPUT() {
		return 0;
	}

	static get INPUT() {
		return 1;
	}

	static get RADIUS() {
		return 7;
	}
}

class ChainFunctionBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {String} id
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, id, x = 0, y = 0) {
		super(chain, id, x, y);
		this.strokeStyle = ChainColor.blue;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.self = new ChainPin(this.chain, this, ChainPin.INPUT);
		this.self.color = ChainColor.blue;
		this.params = Array(1).fill().map(() => new ChainPin(this.chain, this, ChainPin.INPUT));
		this.updatePins();
		this.buttons = this.buttons.concat([
			new ChainButton(this.chain, '-', () => {
				const pin = this.params.pop();
				this.updatePins();
				this.chain.deleteLink(pin);
				this.adjustChildren();
			}),
			new ChainButton(this.chain, '+', () => {
				this.params.push(new ChainPin(this.chain, this, ChainPin.INPUT));
				this.updatePins();
				this.adjustChildren();
			})
		]);
		this.adjustChildren();
	}

	updatePins() {
		this.pins = [this.result, this.self].concat(this.params);
	}

	adjustChildren() {
		super.adjustChildren();
		const dx = Chain.PAD * 4;
		const interval = (this.width - dx * 2) / (this.params.length - 1);
		this.params.forEach((param, i) => {
			const x = (this.params.length === 1) ? this.width / 2 : dx + interval * i;
			param.position(x, - param.radius * 2);
		});
		this.result.position(this.result.radius * 2 + this.width, this.height / 2);
		this.self.position(-this.self.radius * 2, this.height / 2);
	}

	get expression() {
		const self = this.self.value;
		const params = this.params.map((param) => (param.value) ? param.value : 'null').join(',');
		return (self) ? `${self}['${this.value}'](${params})` : `${this.value}(${params})`;
	}
}

class ChainValueBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {String} id
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, id, x = 0, y = 0) {
		super(chain, id, x, y);
		this.strokeStyle = ChainColor.white;
		this.pin = new ChainPin(this.chain, this, ChainPin.OUTPUT, () => {
			return this.expression;
		});
		this.pins.push(this.pin);
		this.adjustChildren();
	}

	adjustChildren() {
		super.adjustChildren();
		this.pin.position(this.width + this.pin.radius * 2, this.height / 2);
	}

	get expression() {
		return this.value;
	}
}

class ChainPropertyBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {String} id
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, id, x = 0, y = 0) {
		super(chain, id, x, y);
		this.strokeStyle = ChainColor.white;
		this.self = new ChainPin(this.chain, this, ChainPin.INPUT);
		this.self.color = ChainColor.blue;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.pins = this.pins.concat([this.self, this.result]);
		this.adjustChildren();
	}

	adjustChildren() {
		super.adjustChildren();
		this.self.position(-this.self.radius * 2, this.height / 2);
		this.result.position(this.width + this.self.radius * 2, this.height / 2);
	}

	get expression() {
		const self = this.self.value;
		return `${self}['${this.value}']`;
	}
}

class ChainOperatorBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {String} id
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, id, x = 0, y = 0) {
		super(chain, id, x, y);
		this.id.align('center', 'middle');
		this.strokeStyle = ChainColor.white;
		this.width = 180;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.params = Array(2).fill().map(() => new ChainPin(this.chain, this, ChainPin.INPUT));
		this.pins = [this.result].concat(this.params);
		this.adjustWidth(50);
		this.adjustChildren();
	}

	adjustChildren() {
		super.adjustChildren();
		this.id.position(this.x + this.width / 2, this.y + this.height / 2);
		this.params[0].position(this.params[0].radius, -this.params[0].radius * 2);
		this.params[1].position(this.width - this.params[1].radius, -this.params[1].radius * 2);
		this.result.position(this.result.radius * 2 + this.width, this.height / 2);
	}

	get expression() {
		const params = this.params.map((param) => param.value);
		return params.join(this.value);
	}
}

class ChainViewBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, x = 0, y = 0) {
		super(chain, '', x, y);
		this.index = -1;
		this.strokeStyle = ChainColor.purple;
		this.pin = new ChainPin(this.chain, this, ChainPin.INPUT);
		this.pin.color = ChainColor.purple;
		this.pins.push(this.pin);
		this.adjustChildren();
	}

	adjustChildren() {
		super.adjustChildren();
		this.pin.position(-this.pin.radius * 2, this.height / 2);
	}

	set value(value) {
		this.id.text = value;
		this.adjustWidth(100);
		this.adjustChildren();
	}
}

class ChainIfBlock extends ChainBlock {
	constructor(chain, x = 0, y = 0) {
		super(chain, 'if', x, y);
		this.id.align('center', 'middle');
		this.strokeStyle = ChainColor.purple;
		this.params = Array(3).fill().map((param) => new ChainPin(this.chain, this, ChainPin.INPUT));
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT, () => {
			return this.expression;
		});
		this.pins = this.pins.concat(this.params, this.result);
	}

	adjustChildren() {
		super.adjustChildren();
		this.id.position(this.x + this.width / 2, this.y + this.height / 2);
		const dx = Chain.PAD * 4;
		const interval = (this.width - dx * 2) / (this.params.length - 1);
		this.params.forEach((param, i) => {
			const x = dx + interval * i;
			param.position(x, - param.radius * 2);
		});
		this.result.position(this.width + this.result.radius * 2, this.height / 2);
	}

	get expression() {
		return `${this.params[0].value} ? ${this.params[1].value} : ${this.params[2].value}`
	}
}

class ChainFunctionizeBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, x = 0, y = 0) {
		super(chain, 'Functionize', x, y);
		this.id.align('center', 'middle');
		this.strokeStyle = ChainColor.blue;
		this.param = new ChainPin(this.chain, this, ChainPin.INPUT);
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.pins = this.pins.concat(this.param, this.result);
		this.adjustChildren();
	}

	draw() {
		super.draw();
	}

	adjustChildren() {
		super.adjustChildren();
		this.id.position(this.x + this.width / 2, this.y + this.height / 2);
		this.param.position(-this.param.radius * 2, this.height / 2);
		this.result.position(this.width + this.result.radius * 2, this.height / 2);
	}

	get expression() {
		return `(() => { ${this.param.value} })`;
	}
}

class Chain {
	/**
	 * @param {AceEditor} editor
	 * @param {HTMLIFrameElement} iframe
	 */
	constructor(editor, iframe) {
		// setup add-block
		const blockMenu = document.querySelector('.chain .block-menu');
		blockMenu.style.display = 'none';
		const blockMenuText = blockMenu.querySelector('input');
		blockMenuText.addEventListener('keydown', this.addBlockByKey.bind(this));
		const blockMenuSelect = blockMenu.querySelector('select');
		blockMenuSelect.addEventListener('change', this.hideMenuText.bind(this));
		blockMenu.querySelector('button').addEventListener('click', this.addBlockByClick.bind(this));
		this.blockMenu = blockMenu;
		this.blockMenuText = blockMenuText;
		this.blockMenuSelect = blockMenuSelect;

		// setup rename
		const renameArea = document.querySelector('.chain .rename-area');
		renameArea.style.display = 'none';
		const renameText = renameArea.querySelector('input');
		renameText.addEventListener('keydown', this.renameBlock.bind(this));
		this.renameArea = renameArea;
		this.renameText = renameText;

		// create canvas
		const canvas = document.querySelector('#chain-canvas');
		canvas.addEventListener('mousemove', this.mousemove.bind(this));
		canvas.addEventListener('mousedown', this.mousedown.bind(this));
		canvas.addEventListener('mouseup', this.mouseup.bind(this));
		canvas.addEventListener('contextmenu', () => event.preventDefault());

		// set properties
		this.editor = editor;
		this.iframe = iframe;
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.status = Chain.DEFAULT;
		this.plugin = '';
		this.mainTarget = null;
		this.renameTarget = null;
		this.pmousex = 0;
		this.pmousey = 0;
		this.mousex = 0;
		this.mousey = 0;
		this.mousedowing = false;
		this.mouse = new ChainCircle(this, 0, 0, 10);
		this.mouse.fillStyle = 'rgba(255, 255, 255, 0.2)';
		this.expressions = [];

		// set blocks, links
		this.rope = new ChainRope(this);
		this.displayedBlocks = [];
		this.linkedBlocks = [];
		this.links = [];

		// When window is resized, canvas fits parent element.
		this.fit();
		window.addEventListener('resize', this.fit.bind(this));

		// Receiving message, set message to View Blocks
		window.addEventListener('message', this.updateViewBlocks.bind(this));

		// contextmenu don't be shown
		window.addEventListener('contextmenu', () => event.preventDefault());

		// draw is main loop
		this.draw();
	}

	draw() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.displayedBlocks.forEach((a) => a.draw());
		this.links.forEach((a) => a.draw());
		this.mouse.draw();
		if (this.status === Chain.LINK) {
			this.rope.draw();
		}
		requestAnimationFrame(this.draw.bind(this));
	}

	fit() {
		const rect = this.canvas.parentElement.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
	}

	hideMenuText() {
		this.blockMenuText.style.display = (['function', 'value', 'property', 'operator'].includes(event.target.value)) ? '' : 'none';
		this.blockMenuText.focus();
	}

	/**
	 * @param {String} type
	 * @param {Number} x
	 * @param {Number} y
	 * @param {String} value
	 * @returns {ChainBlock}
	 */
	createBlock(type, value, x, y) {
		let block;
		switch (type) {
			case 'function':
				block = new ChainFunctionBlock(this, value);
				break;
			case 'value':
				block = new ChainValueBlock(this, value);
				break;
			case 'property':
				block = new ChainPropertyBlock(this, value);
				break;
			case 'operator':
				block = new ChainOperatorBlock(this, value);
				break;
			case 'view':
				block = new ChainViewBlock(this);
				break;
			case 'if':
				block = new ChainIfBlock(this);
				break;
			case 'functionize':
				block = new ChainFunctionizeBlock(this);
				break;
			default:
				break;
		}
		block.position(x, y);
		return block;
	}

	addBlockByKey() {
		const value = this.blockMenuText.value.trim();
		const select = this.blockMenuSelect.value;
		if (event.keyCode !== 13 || value === '') {
			return;
		}
		const x = parseInt(this.blockMenu.style.left, 10);
		const y = parseInt(this.blockMenu.style.top, 10);
		this.displayedBlocks.push(this.createBlock(select, value, x, y));
		this.blockMenu.style.display = 'none';
	}

	addBlockByClick() {
		const value = this.blockMenuText.value.trim();
		const select = this.blockMenuSelect.value;
		if (value === '' && (['function', 'value', 'property', 'operator'].includes(select))) {
			return;
		}
		const x = parseInt(this.blockMenu.style.left, 10);
		const y = parseInt(this.blockMenu.style.top, 10);
		this.displayedBlocks.push(this.createBlock(select, value, x, y));
		this.blockMenu.style.display = 'none';
	}

	mousemove() {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const dx = this.mousex - this.pmousex;
		const dy = this.mousey - this.pmousey;
		this.pmousex = this.mousex;
		this.pmousey = this.mousey;
		this.mousex = x;
		this.mousey = y;
		this.mouse.x = this.mousex;
		this.mouse.y = this.mousey;

		if (this.mousedowing) {
			switch (this.status) {
				case Chain.MOVE_BLOCK:
					// if there is selected function, move it
					this.mainTarget.position(this.mainTarget.x + dx, this.mainTarget.y + dy);
					break;
				case Chain.LINK:
					this.rope.end(this.mousex, this.mousey);
					break;
				default:
					if (this.mainTarget && this.mainTarget.constructor === ChainButton && !this.mainTarget.contains(this.mousex, this.mousey)) {
						this.mainTarget = null;
					}
					break;
			}
		}
	}

	mousedown() {
		this.mousedowing = true;
		this.blockMenu.style.display = 'none';
		this.renameArea.style.display = 'none';

		// select one of pin or block
		this.displayedBlocks.reverse().every((block) => {
			const pin = block.getPinContains(this.mousex, this.mousey);
			const button = block.getButtonContains(this.mousex, this.mousey);
			switch (true) {
				case pin && event.button === 0:
					// Input pin has only one link. So, if already has link, delete its link.
					if (pin.type === ChainPin.INPUT) {
						this.deleteLink(pin);
					}

					this.status = Chain.LINK
					this.mainTarget = pin;
					pin.linked = true;
					this.rope.begin(this.mainTarget.x, this.mainTarget.y);
					this.rope.end(this.mainTarget.x, this.mainTarget.y);

					this.sortBlocks(block);
					return false;
				case button && event.button === 0:
					this.mainTarget = button;
					return false;
				case block.contains(this.mousex, this.mousey) && event.button === 0:
					// select box
					this.mainTarget = block;
					this.status = Chain.MOVE_BLOCK

					this.sortBlocks(block);
					return false;
				default:
					return true;
			}
		});
	}

	mouseup() {
		const block = this.displayedBlocks.reverse().filter((a) => a.contains(this.mousex, this.mousey))[0];
		switch (true) {
			case this.status === Chain.LINK:
				if (this.mainTarget.type === ChainPin.INPUT || (this.mainTarget.type === ChainPin.OUTPUT && this.mainTarget.toPins.length === 0)) {
					this.mainTarget.linked = false;
				}
				this.displayedBlocks.every((block) => {
					const pin = block.getPinContains(this.mousex, this.mousey);
					if (!pin) {
						return true;
					}
					const pins = [this.mainTarget, pin].sort((a, b) => a.type - b.type);

					// if two pins isn't output and input, don't link.
					if (pins.map((a) => a.type).join('') !== '01') {
						return false;
					}

					// delete link that has input.
					this.deleteLink(pins[1]);
					this.links.push(this.createLink(pins[0], pins[1]));
					return false;
				});
				break;
			case this.status === Chain.MOVE_BLOCK:
				break;
			case this.status === Chain.DEFAULT && event.button === 0:
				if (this.mainTarget && this.mainTarget.constructor === ChainButton) {
					this.mainTarget.click();
				}
				break;
			case block && this.status === Chain.DEFAULT && event.button === 2 && block.constructor !== ChainViewBlock:
				this.renameTarget = block;
				this.renameArea.style.display = '';
				this.renameText.value = this.renameTarget.value;
				this.renameText.focus();
				this.renameArea.style.left = `${this.mousex}px`;
				this.renameArea.style.top = `${this.mousey}px`;
				break;
			case !block && this.status === Chain.DEFAULT && event.button === 2:
				this.blockMenu.style.display = '';
				this.blockMenuSelect.focus();
				this.blockMenuText.value = '';
				this.blockMenu.style.left = this.mousex + 'px';
				this.blockMenu.style.top = this.mousey + 'px';
				break;
			default:
				break;
		}

		this.updateFrame();

		// reset properties
		this.mousedowing = false;
		this.mainTarget = null;
		this.status = Chain.DEFAULT;
	}

	renameBlock() {
		const value = this.renameText.value.trim();
		if (event.keyCode !== 13 || value === '') {
			return;
		}
		this.renameTarget.value = value;
		this.renameArea.style.display = 'none';
		this.updateFrame();
	}

	/**
	 * if a link contains targetPin, delete its link
	 * @param {ChainPin} targetPin
	 */
	deleteLink(targetPin) {
		this.links = this.links.filter((link) => {
			if (link.linkedPins.includes(targetPin)) {
				const outputPin = link.linkedPins[0];
				const inputPin = link.linkedPins[1];
				outputPin.deleteLink(inputPin);
				inputPin.value = null;
				inputPin.linked = false;

				// if parent doesn't have any link, delete it from linkedBlocks.
				[outputPin.parent, inputPin.parent].forEach((parent) => {
					if (parent.pins.filter((pin) => pin.linked).length > 0) {
						return;
					}
					this.linkedBlocks = this.linkedBlocks.filter((a) => a !== parent);
				});
				return false;
			}
			return true;
		});
	}

	/**
	 * @param {ChainPin} outputPin
	 * @param {ChainPin} inputPin
	 * @returns {ChainLink}
	 */
	createLink(outputPin, inputPin) {
		const link = new ChainLink(this, outputPin, inputPin);
		outputPin.addLink(inputPin);
		if (!this.linkedBlocks.includes(inputPin.parent)) {
			this.linkedBlocks.push(inputPin.parent);
		}
		const inputIndex = this.linkedBlocks.indexOf(inputPin.parent);
		// if linkedBlocks has parent of outputPin, delete it.
		this.linkedBlocks = this.linkedBlocks.filter((a) => a !== outputPin.parent);
		this.linkedBlocks.splice(inputIndex - 1, 0, outputPin.parent);
		return link;
	}

	/**
	 * if a link contains targetPin, return its link
	 * @param {ChainPin} targetPin
	 */
	getLink(targetPin) {
		const link = this.links.filter((link) => link.linkedPins.includes(targetPin))[0];
		return link;
	}

	/**
	 * Sorting Blocks that targetBlock is at the head
	 * @param {ChainBlock} targetBlock
	 */
	sortBlocks(targetBlock) {
		this.displayedBlocks = this.displayedBlocks.sort((a, b) => (a === targetBlock) ? 1 : 0);
	}

	/**
	 * set new code to iframe
	 */
	updateFrame() {
		// send all
		this.expressions = [];
		let viewIndex = 0;

		// reset index of view
		this.displayedBlocks.forEach((a) => {
			if (a.constructor === ChainViewBlock) {
				a.index = -1;
				a.value = '';
			}
		});

		// set expressions to iframe
		this.linkedBlocks.forEach((block) => {
			block.pins.forEach((pin) => {
				if (pin.type === ChainPin.INPUT) {
					return;
				}
				const isOrFunctionOperatorIf = [ChainFunctionBlock, ChainOperatorBlock, ChainIfBlock].includes(block.constructor);
				const viewBlocks = pin.toPins.map(((a) => a.parent)).filter((a) => a.constructor === ChainViewBlock);
				switch (true) {
					case pin.linked && viewBlocks.length === 0:
						pin.send();
						break;
					case pin.linked && viewBlocks.length > 0:
						// set index of view
						viewBlocks.forEach((a) => a.index = viewIndex);
					case !pin.linked && isOrFunctionOperatorIf:
						this.expressions.push(block.expression);
						viewIndex += 1;
						break;
					default:
						break;
				}
			});
		});

		// for debug
		console.log(this.expressions);
		console.log('-------------------------');

		const d = new DOMParser().parseFromString(this.editor.getValue(), 'text/html');
		const s = document.createElement('script');
		s.innerText = `window.parent.postMessage(${JSON.stringify(this.expressions)}.map((a) =>  { try { return String((0, eval)(a)); } catch (e) { return String(e); } }), '*')`;
		d.body.appendChild(s);
		this.iframe.src = `data:text/html, ${[d.doctype ? new XMLSerializer().serializeToString(d.doctype) : '', d.documentElement.outerHTML].join('')}`;
	}

	/**
	 * set a return value to View Block
	 */
	updateViewBlocks() {
		const data = event.data;
		this.linkedBlocks.forEach((block) => {
			if (block.constructor !== ChainViewBlock) {
				return;
			}
			const index = block.index;
			block.value = data[index];
		});
	}

	static get DEFAULT() {
		return 0;
	}

	static get MOVE_BLOCK() {
		return 1;
	}

	static get LINK() {
		return 2;
	}

	static get PAD() {
		return 7;
	}
}

module.exports = Chain;