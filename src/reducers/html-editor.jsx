import { handleActions } from 'redux-actions';
import actions from '../actions';
import initialValue from '../example-html.txt';

export default handleActions({
	[actions.onChangeHtml]: (state, action) => {
		const { payload } = action;

		return payload;
	},
}, initialValue);