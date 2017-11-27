import _ from 'lodash';
import { createActions } from 'redux-actions';
import { generator } from '../util';

export default createActions(
	{
		ADD_BLOCK: (block) => _.merge({ id: generator.id() }, block),
		UPDATE_BLOCK: (id, patch) => ({ id, patch }),
		DELTA_MOVE_BLOCK: (id, dx, dy) => ({ id, dx, dy }),
		TOGGLE_BLOCK_CREATOR: (x, y) => ({ x, y })
	},
	'DELETE_BLOCK',
	'UPDATE_BLOCK_CREATOR',
	'ADD_PIN',
	'DELETE_PIN',
	'START_POINT_LINK',
	'END_POINT_LINK',
	'ADD_PIN_LINK',
	'REMOVE_PIN_LINK_BY_QUERY',
	'ON_CHANGE_HTML',
	'CLEAR_VIEW_BLOCK',
	'PUSH_VIEW_BLOCK',
	'SHOW_BLOCK_CREATOR'
);
