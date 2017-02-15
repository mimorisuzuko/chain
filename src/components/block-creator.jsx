const React = require('react');
const Immutable = require('immutable');
const Radium = require('radium');
const _ = require('lodash');
const {black, lblack, blue} = require('../color.jsx');
const {BlockModel: {BLOCK_LIST}} = require('./block.jsx');
const {Record} = Immutable;
const {Component} = React;
const blockNames = _.keys(BLOCK_LIST);

const Textarea = Radium(class Textarea extends Component {
	render() {
		const {props: {value}} = this;

		return (
			<textarea onChange={this.onChange.bind(this)} value={value} style={{
				display: 'block',
				border: 'none',
				backgroundColor: lblack,
				marginBottom: 5,
				outline: 'none',
				borderColor: 'transparent',
				borderWidth: 1,
				width: '100%',
				boxSizing: 'border-box',
				borderStyle: 'solid',
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

class Button extends Component {
	render() {
		const {props: {value}} = this;

		return (
			<a href='#' onClick={this.onClick.bind(this)} style={{
				textTransform: 'uppercase',
				display: 'inline-block',
				backgroundColor: lblack,
				padding: '4px 8px',
				borderRadius: 4,
				outline: 'none'
			}}>
				{value}
			</a>
		);
	}

	/**
	 * @param {MouseEvent} e
	 */
	onClick(e) {
		const {props: {onClick}} = this;

		onClick(e);
	}
}

class BlockCreatorModel extends Record({ x: 0, y: 0, value: '', visible: false, name: blockNames[0] }) {
	toggle() {
		const {visible} = this;

		return this.set('visible', !visible);
	}

	static get WIDTH() {
		return 180;
	}
}

const BlockCreator = Radium(class BlockCreator extends Component {
	render() {
		const {WIDTH: width} = BlockCreatorModel;
		const {props: {model, add}} = this;
		const name = model.get('name');
		const {editablevalue} = BLOCK_LIST[name];

		return (
			model.get('visible') ?
				<div style={{
					position: 'absolute',
					left: model.get('x'),
					top: model.get('y'),
					padding: 10,
					width,
					backgroundColor: black,
					border: `1px solid ${lblack}`,
					boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)'
				}}>
					<select onChange={this.onChangeSelect.bind(this)} value={name} style={{
						display: 'block',
						width: '100%',
						marginBottom: 5,
						backgroundColor: lblack,
						borderWidth: 1,
						borderStyle: 'solid',
						borderColor: 'transparent',
						outline: 'none',
						':focus': {
							borderColor: blue
						}
					}}>
						{_.map(blockNames, (a, i) => <option value={a}>{`${_.capitalize(a)} Block`}</option>)}
					</select>
					{editablevalue !== false ? <Textarea value={model.get('value')} onChange={this.onChangeTextarea.bind(this)} /> : null}
					<Button value='add' onClick={add} />
				</div>
				: null
		);
	}

	/**
	 * @param {Event} e
	 */
	onChangeTextarea(e) {
		const {currentTarget: {value}} = e;
		const {props: {model, update}} = this;

		update(model.set('value', value));
	}

	/**
	 * @param {Event} e
	 */
	onChangeSelect(e) {
		const {currentTarget: {value}} = e;
		const {props: {model, update}} = this;

		update(model.set('name', value));
	}
});

module.exports = { BlockCreator, BlockCreatorModel };