import _ from 'lodash';
import { createActions } from 'redux-actions';
import { generator } from '../util';

let balloonId = -1;

export default createActions(
	{
		ADD_BLOCK: (block) => _.merge({ id: generator.id() }, block),
		UPDATE_BLOCK: (id, patch) => ({ id, patch }),
		DELTA_MOVE_BLOCK: (id, dx, dy) => ({ id, dx, dy }),
		TOGGLE_BLOCK_CREATOR: (x, y) => ({ x, y }),
		ADD_BALLOON: (balloon) => _.merge({ id: balloonId += 1 }, balloon)
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
	'DECREMENT_BALLOONS',
	'SHOW_BLOCK_CREATOR',
	'COCHAIN_SET_IN_BLOCK',
	'COCHAIN_REMOVE_PIN_LINK',
	'COCHAIN_SET_IN_PIN_LINK'
);