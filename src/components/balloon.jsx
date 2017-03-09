const React = require('react');
const Immutable = require('immutable');
const _ = require('lodash');
const { orange } = require('../color');
const { Record } = Immutable;
const { Component } = React;

class BalloonModel extends Record({ value: '', life: 0 }) {
	constructor(o) {
		super(_.assign({ life: BalloonModel.MAX_LIFE }, o));
	}

	decrementLife() {
		const { life } = this;

		return this.set('life', life - 1);
	}

	static get MAX_LIFE() {
		return 300;
	}
}

class Balloon extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	render() {
		const { props: { model } } = this;

		return (
			<div onClick={this.onClick} style={{
				backgroundColor: orange,
				color: 'white',
				cursor: 'pointer',
				padding: '5px 10px',
				marginBottom: 5,
				borderRadius: 4,
				fontSize: '1rem',
				opacity: Math.cos(Math.PI / 2 * (1 - model.get('life') / BalloonModel.MAX_LIFE)),
				boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)'
			}}>
				{model.get('value')}
			</div>
		);
	}

	onClick() {
		const { props: { remove, index } } = this;

		remove(index);
	}
}

module.exports = { Balloon, BalloonModel };