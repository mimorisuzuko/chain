import { List } from 'immutable';
import { PinLink } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.addPinLink]: (state, action) => {
		const { payload } = action;

		console.log(payload);

		return state.push(new PinLink(payload));
	}
}, List());