import { List } from 'immutable';
import { handleActions } from 'redux-actions';
import actions from '../actions';
import { Balloon } from '../models';

export default handleActions({
	[actions.addBalloon]: (state, action) => {
		const { payload } = action;

		return state.push(new Balloon(payload));
	},
	[actions.decrementBalloons]: (state) => {
		let nextState = List();
		state.forEach((a) => {
			const next = a.get('life') - 1;

			if (next > 0) {
				nextState = nextState.push(a.set('life', next));
			}
		});

		return nextState;
	}
}, List());