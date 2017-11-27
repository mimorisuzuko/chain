import { BlockCreator } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.updateBlockCreator]: (state, action) => {
		const { payload } = action;

		return state.merge(payload);
	},
	[actions.showBlockCreator]: (state, action) => {
		const { payload: { x, y } } = action;

		return state.show(x, y);
	}
}, new BlockCreator());
