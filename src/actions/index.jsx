import _ from 'lodash';
import { createActions } from 'redux-actions';

const ADD_BLOCK = 'ADD_BLOCK';
const UPDATE_BLOCK = 'UPDATE_BLOCK';
const DELETE_BLOCK = 'DELETE_BLOCK';
const DELTA_MOVE_BLOCK = 'DELTA_MOVE_BLOCK';
const TOGGLE_BLOCK_CREATOR = 'TOGGLE_BLOCK_CREATOR';
const UPDATE_BLOCK_CREATOR = 'UPDATE_BLOCK_CREATOR';
const ADD_PIN = 'ADD_PIN';
const DELETE_PIN = 'DELETE_PIN';

let blockId = 0;

export default createActions(
	{
		[ADD_BLOCK]: (block = { value: '', x: 0, y: 0 }) => _.merge({ id: blockId += 1 }, block),
		[UPDATE_BLOCK]: (id, patch) => ({ id, patch }),
		[DELTA_MOVE_BLOCK]: (id, dx, dy) => ({ id, dx, dy }),
		[TOGGLE_BLOCK_CREATOR]: (x, y) => ({ x, y })
	},
	DELETE_BLOCK,
	UPDATE_BLOCK_CREATOR,
	ADD_PIN,
	DELETE_PIN,
	'START_POINT_LINK',
	'END_POINT_LINK',
	'ADD_PIN_LINK'
);