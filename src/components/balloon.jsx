const React = require('react');
const Immutable = require('immutable');
const { orange } = require('../color');
const { Record } = Immutable;
const { Component } = React;

class BalloonModel extends Record({ value: '', life: 100 }) {
	static get MAX_LIFE() {
		return 100;
	}
}

class Balloon extends Component {
	constructor(props) {
		super(props);

		this.loop = this.loop.bind(this);
		this.onClick = this.onClick.bind(this);
		this.animation = 0;
	}

	loop() {
		const { props: { model, update, index, remove } } = this;
		const _life = model.get('life');
		const life = _life - 1;

		if (life <= 0) {
			remove(index);
		} else {
			update(index, model.set('life', life));
			this.animation = requestAnimationFrame(this.loop);
		}
	}

	componentDidMount() {
		this.loop();
	}

	componentWillUnmount() {
		const { animation } = this;

		cancelAnimationFrame(animation);
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