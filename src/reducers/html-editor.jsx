import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.onChangeHtml]: (state, action) => {
		const { payload } = action;

		return payload;
	},
}, `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
</head>
<body>
	<h1>Hello, World!</h1>
</body>
</html>
`);