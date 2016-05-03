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
		this.lineWidth = 1;
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
		this.click = click;
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
	constructor(chain, id = '', x = 0, y = 0) {
		super(chain, x, y);
		this.strokeStyle = ChainColor.lightgray;
		this.fillStyle = ChainColor.gray;
		this.id = new ChainText(this.chain, id);
		this.id.align('left', 'middle');
		this.topPins = [];
		this.rightPins = [];
		this.bottomPins = [];
		this.leftPins = [];
		const close = new ChainButton(this.chain, '×', () => {
			this.chain.displayedBlocks = this.chain.displayedBlocks.filter((a) => a !== this);
			this.allPins.forEach((a) => this.chain.deleteLink(a));
		});
		close.fillStyle = ChainColor.red;
		this.buttons = [close];
		this.adjustWidth(100);
	}

	draw() {
		super.draw();
		this.id.draw();
		this.allPins.forEach((a) => a.draw());
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
		const pin = this.allPins.filter((a) => a.contains(x, y))[0];
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

	/**
	 * @param {Number} rate
	 */
	adjustHeightByRate(rate) {
		this.height = ChainPin.RADIUS * 2 + (ChainPin.RADIUS * 2.5) * (rate - 1);
	}

	adjustChildren() {
		const r = ChainPin.RADIUS;
		this.adjustHeightByRate(Math.max(2, this.leftPins.length, this.rightPins.length));
		this.id.position(this.x + Chain.PAD, this.y + Chain.PAD * 2 + (this.height - Chain.PAD * 2) / 2);
		this.buttons.forEach((a, i) => a.position(this.x + (a.width + 1) * i, this.y));
		this.topPins.forEach((a, i) => a.position(r + (r * 2.5) * i, -r * 2));
		this.rightPins.forEach((a, i) => a.position(this.width + r * 2, r + (r * 2.5) * i));
		this.bottomPins.forEach((a, i) => a.position(r + (r * 2.5) * i, this.height + r * 2));
		this.leftPins.forEach((a, i) => a.position(-r * 2, r + (r * 2.5) * i));
	}

	set value(value) {
		this.id.text = value;
	}

	get value() {
		return this.id.text;
	}

	get allPins() {
		return [].concat(this.topPins, this.rightPins, this.bottomPins, this.leftPins);
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

	static get OUTPUT_RESULT() {
		return 0;
	}

	static get OUTPUT_SELF() {
		return 1;
	}

	static get INPUT() {
		return 2;
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
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.rightPins.push(this.result);
		this.self = new ChainPin(this.chain, this, ChainPin.INPUT);
		this.self.color = ChainColor.blue;
		this.params = [new ChainPin(this.chain, this, ChainPin.INPUT)];
		this.leftPins = [].concat(this.self, this.params);
		this.buttons = this.buttons.concat([
			new ChainButton(this.chain, '+', () => {
				this.addParam();
			}),
			new ChainButton(this.chain, '-', () => {
				this.deleteParam();
			})
		]);
		this.adjustChildren();
	}

	addParam() {
		this.params.push(new ChainPin(this.chain, this, ChainPin.INPUT));
		this.leftPins = [].concat(this.self, this.params);
		this.adjustChildren();
	}

	deleteParam() {
		const param = this.params.pop();
		this.chain.deleteLink(param);
		this.leftPins = [].concat(this.self, this.params);
		this.adjustChildren();
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
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.rightPins.push(this.result);
		this.adjustChildren();
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
		this.leftPins.push(this.self);
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.rightPins.push(this.result);
		this.adjustChildren();
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
		this.strokeStyle = ChainColor.white;
		this.width = 180;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.rightPins.push(this.result);
		this.result.color = ChainColor.purple;
		this.params = Array(2).fill().map(() => new ChainPin(this.chain, this, ChainPin.INPUT));
		this.leftPins = this.params;
		this.adjustWidth(50);
		this.adjustChildren();
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
		this.view = new ChainPin(this.chain, this, ChainPin.INPUT);
		this.view.color = ChainColor.purple;
		this.leftPins.push(this.view);
		this.adjustChildren();
	}

	set value(value) {
		this.id.text = value;
		this.adjustWidth(100);
		this.adjustChildren();
	}
}

class ChainIfBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, x = 0, y = 0) {
		super(chain, 'if', x, y);
		this.strokeStyle = ChainColor.purple;
		this.params = Array(3).fill().map((param) => new ChainPin(this.chain, this, ChainPin.INPUT));
		this.leftPins = this.params;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.rightPins.push(this.result);
		this.adjustChildren();
	}

	get expression() {
		return `${this.params[0].value} ? ${this.params[1].value} : ${this.params[2].value}`;
	}
}

class ChainRepeatBlock extends ChainBlock {
	/**
	 * @param {Chain} chain
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(chain, x = 0, y = 0) {
		super(chain, 'repeat', x, y);
		this.strokeStyle = ChainColor.purple;
		this.repeatCounterIndex = new Date().getTime();
		this.params = Array(2).fill().map((param) => new ChainPin(this.chain, this, ChainPin.INPUT));
		this.index = new ChainPin(this.chain, this, ChainPin.OUTPUT_SELF, () => {
			return `_${this.repeatCounterIndex}`;
		});
		this.params.splice(1, 0, this.index);
		this.leftPins = this.params;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.rightPins = [this.result];
		this.adjustChildren();
	}

	get expression() {
		return `for (let _${this.repeatCounterIndex} = 0; _${this.repeatCounterIndex} < ${this.params[0].value}; _${this.repeatCounterIndex} += 1) ${this.params[2].value}`;
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
		this.strokeStyle = ChainColor.blue;
		this.params = [new ChainPin(this.chain, this, ChainPin.INPUT)];
		this.leftPins = this.params;
		this.result = new ChainPin(this.chain, this, ChainPin.OUTPUT_RESULT, () => {
			return this.expression;
		});
		this.result.color = ChainColor.purple;
		this.rightPins.push(this.result);
		this.adjustChildren();
	}

	draw() {
		super.draw();
	}

	get expression() {
		return `(() => { ${this.param.value} })`;
	}
}

class Chain {
	/**
	 * @param {undefined} editor
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

		// set infomation of block
		this.constantIDBlockValues = ['view', 'if', 'repeat', 'functionize'];
		this.tableValueToConstructor = {
			function: ChainFunctionBlock,
			value: ChainValueBlock,
			property: ChainPropertyBlock,
			operator: ChainOperatorBlock,
			view: ChainViewBlock,
			if: ChainIfBlock,
			repeat: ChainRepeatBlock,
			functionize: ChainFunctionizeBlock
		};
		this.constantIDBlockConstructors = this.constantIDBlockValues.map((a) => this.tableValueToConstructor[a]);

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
		this.blockMenuText.style.display = (!this.constantIDBlockValues.includes(event.target.value)) ? '' : 'none';
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
		const Block = this.tableValueToConstructor[type];
		const block = this.constantIDBlockValues.includes(type) ? new Block(this, x, y) : new Block(this, value, x, y);
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
		if (value === '' && (!this.constantIDBlockValues.includes(select))) {
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
				if (this.mainTarget.type === ChainPin.INPUT || ([ChainPin.OUTPUT_RESULT, ChainPin.OUTPUT_SELF].includes(this.mainTarget.type) && this.mainTarget.toPins.length === 0)) {
					this.mainTarget.linked = false;
				}
				this.displayedBlocks.every((block) => {
					const pin = block.getPinContains(this.mousex, this.mousey);
					if (!pin) {
						return true;
					}
					const pins = [this.mainTarget, pin].sort((a, b) => a.type - b.type);

					// if two pins isn't output and input, don't link.
					if (!['02', '12'].includes(pins.map((a) => a.type).join(''))) {
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
			case block && this.status === Chain.DEFAULT && event.button === 2 && !this.constantIDBlockConstructors.includes(block.constructor):
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
					if (parent.allPins.filter((pin) => pin.linked).length > 0) {
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
		const outputIndex = this.linkedBlocks.indexOf(inputPin.parent) - 1;
		// if linkedBlocks has parent of outputPin, delete it.
		this.linkedBlocks = this.linkedBlocks.filter((a) => a !== outputPin.parent);
		outputIndex > -1 ? this.linkedBlocks.splice(outputIndex, 0, outputPin.parent) : this.linkedBlocks.unshift(outputPin.parent);
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
		// reset index of view
		this.displayedBlocks.forEach((a) => {
			if (a.constructor === ChainViewBlock) {
				a.index = -1;
				a.value = '';
			}
		});

		// send all
		this.expressions = [];
		let viewIndex = 0;
		// set expressions to iframe
		this.linkedBlocks.forEach((block) => {
			block.allPins.forEach((pin) => {
				if (pin.type === ChainPin.INPUT) {
					return;
				}
				const isExecutableBlock = [ChainFunctionBlock, ChainOperatorBlock, ChainIfBlock, ChainRepeatBlock].includes(block.constructor);
				const viewBlocks = pin.toPins.map(((a) => a.parent)).filter((a) => a.constructor === ChainViewBlock);
				switch (true) {
					case pin.linked && viewBlocks.length === 0:
						pin.send();
						break;
					case pin.linked && viewBlocks.length > 0:
						// set index of view
						viewBlocks.forEach((a) => a.index = viewIndex);
					case !pin.linked && isExecutableBlock && pin.type === ChainPin.OUTPUT_RESULT:
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