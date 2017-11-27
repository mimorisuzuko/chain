import { List } from 'immutable';
import { PinLink } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.addPinLink]: (state, action) => {
		const { payload } = action;
		const query = { input: payload.input };

		return state.filter((link) => !link.match(query)).push(new PinLink(payload));
	},
	[actions.deleteBlock]: (state, action) => {
		const { payload } = action;

		return state.filter((link) => !link.hasBlock(payload));
	},
	[actions.removePinLinkByQuery]: (state, action) => {
		const { payload } = action;

		return state.filter((link) => !link.match(payload));
	},
	[actions.deletePin]: (state, action) => {
		const { payload: { id, removed } } = action;

		if (removed === 0) {
			return state;
		}

		return state.filter((link) => !link.match({ input: { block: id, pin: removed } }));
	},
}, List());
