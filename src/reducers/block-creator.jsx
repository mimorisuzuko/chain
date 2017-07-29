import { BlockCreator } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.toggleBlockCreator]: (state, action) => {
		const { payload: { x, y } } = action;

		return state.toggle(x, y);
	},
	[actions.updateBlockCreator]: (state, action) => {
		const { payload } = action;

		return state.merge(payload);
	}
}, new BlockCreator());