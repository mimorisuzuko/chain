import merge from 'lodash.merge';
import { createActions } from 'redux-actions';

const ADD_BLOCK = 'ADD_BLOCK';
const UPDATE_BLOCK = 'UPDATE_BLOCK';
const DELETE_BLOCK = 'DELETE_BLOCK';
const DELTA_MOVE_BLOCK = 'DELTA_MOVE_BLOCK';

let blockId = -1;

export default createActions(
	{
		[ADD_BLOCK]: (block = { value: '', x: 0, y: 0 }) => merge({ id: blockId += 1 }, block),
		[UPDATE_BLOCK]: (id, patch) => ({ id, patch }),
		[DELTA_MOVE_BLOCK]: (id, dx, dy) => ({ id, dx, dy })
	},
	DELETE_BLOCK
);