import React, { Component } from 'react';
import { connect } from 'react-redux';
import autobind from 'autobind-decorator';
import actions from '../actions';
import './Balloons.scss';

@connect(
	(state) => ({
		balloons: state.balloons
	})
)
export default class Balloons extends Component {
	componentDidMount() {
		this.loop();
	}

	render() {
		const { props: { balloons } } = this;

		return (
			<div styleName='base'>{balloons.map((a) => <div key={a.get('id')} style={{ opacity: a.nlife() }}>{a.get('value')}</div>)}</div>
		);
	}

	@autobind
	loop() {
		const { props: { dispatch } } = this;

		dispatch(actions.decrementBalloons());
		requestAnimationFrame(this.loop);
	}
}