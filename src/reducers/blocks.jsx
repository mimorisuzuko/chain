import { List } from 'immutable';
import Block from '../models/Block';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.addBlock]: (state, action) => {
		const { payload } = action;

		return state.push(new Block(payload));
	},
	[actions.updateBlock]: (state, action) => {
		const { payload: { id, patch } } = action;

		return state.map((a, i) => i === id ? a.merge(patch) : a);
	},
	[actions.deleteBlock]: (state, action) => {
		const { payload } = action;

		return state.filter((a, i) => i !== payload);
	},
	[actions.deltaMoveBlock]: (state, action) => {
		const { payload: { id, dx, dy } } = action;

		return state.map((a, i) => i === id ? a.dmove(dx, dy) : a);
	}
}, List());