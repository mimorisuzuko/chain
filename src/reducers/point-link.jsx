import { List } from 'immutable';
import { PointLink } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.startPointLink]: (state, action) => {
		const { payload: { x, y } } = action;

		return state.start(x, y);
	},
	[actions.endPointLink]: (state, action) => {
		const { payload: { x, y } } = action;

		return state.end(x, y);
	}
}, new PointLink());