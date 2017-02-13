const React = require('react');
const Immutable = require('immutable');
const Radium = require('radium');
const {black, lblack, red, blue} = require('../color.jsx');
const {Record} = Immutable;
const {Component} = React;

class BlockModel extends Record({ x: 0, y: 0, value: 'Hello, World!' }) {

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const {x, y} = this;

		return this.merge({ x: x + dx, y: y + dy });
	}

	static get WIDTH() {
		return 180;
	}
}

class Button extends Component {
	render() {
		const {props: {value, backgroundColor}} = this;

		return (
			<a href='#' onClick={this.onClick.bind(this)} style={{
				padding: '1px 8px',
				backgroundColor,
				marginRight: 1
			}}>
				{value}
			</a>
		);
	}

	onClick() {
		const {props: {onClick}} = this;

		onClick();
	}
}

const Textarea = Radium(class _Textarea extends Component {
	render() {
		const {props: {value}} = this;

		return (
			<textarea value={value} onChange={this.onChange.bind(this)} style={{
				display: 'block',
				borderWidth: 1,
				borderStyle: 'solid',
				borderColor: 'transparent',
				outline: 'none',
				backgroundColor: lblack,
				width: '100%',
				boxSizing: 'border-box',
				':focus': {
					borderColor: blue
				}
			}} />
		);
	}

	/**
	 * @param {Event} e
	 */
	onChange(e) {
		const {props: {onChange}} = this;

		onChange(e);
	}
});

class Block extends Component {
	constructor(props) {
		super(props);

		this.px = 0;
		this.py = 0;
		this.mouseMover = null;
		this.mouseUpper = null;
	}

	render() {
		const {WIDTH: width} = BlockModel;
		const {props: {model, onChange, remove}} = this;

		return (
			<div data-movable={true} onMouseDown={this.onMouseDown.bind(this)} style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				width,
				border: `1px solid ${lblack}`,
				boxSizing: 'border-box',
				backgroundColor: black,
				boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)'
			}}>
				<div data-movable={true}>
					<Button value='×' backgroundColor={red} onClick={remove} />
				</div>
				<div data-movable={true} style={{
					padding: '10px 5px 5px'
				}}>
					<Textarea value={model.get('value')} onChange={this.onChangeTextarea.bind(this)} />
				</div>
			</div>
		);
	}

	/**
	 * @param {Event} e
	 */
	onChangeTextarea(e) {
		const {props: {model, update}} = this;
		const {currentTarget: {value}} = e;

		update(model.set('value', value));
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseDown(e) {
		const {target: {dataset: {movable}}, clientX, clientY} = e;

		if (!Boolean(movable)) { return; }
		const mouseMover = this.onMouseMove.bind(this);
		const mouseUpper = this.onMouseUp.bind(this);

		document.body.classList.add('cursor-move');
		document.addEventListener('mousemove', mouseMover);
		document.addEventListener('mouseup', mouseUpper);
		this.px = clientX;
		this.py = clientY;
		this.mouseMover = mouseMover;
		this.mouseUpper = mouseUpper;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseMove(e) {
		const {props: {model, update}, px, py} = this;
		const {clientX, clientY} = e;
		const dx = clientX - px;
		const dy = clientY - py;

		update(model.dmove(dx, dy));
		this.px = clientX;
		this.py = clientY;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseUp(e) {
		const {mouseMover, mouseUpper} = this;

		document.body.classList.remove('cursor-move');
		document.removeEventListener('mousemove', mouseMover);
		document.removeEventListener('mouseup', mouseUpper);
		this.mouseMover = null;
		this.mouseUpper = null;
	}
}

module.exports = { Block, BlockModel };