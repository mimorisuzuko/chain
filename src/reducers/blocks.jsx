import { List } from 'immutable';
import { BlockCreator, Block, Pin } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';
import map from 'lodash.map';
import { purple, white } from '../color';

/**
 * @param {string[]} colors
 */
const createPins = (colors) => List(map(colors, (color, id) => new Pin({ id, color })));

export default handleActions({
	[actions.addBlock]: (state, action) => {
		const { payload } = action;

		switch (payload.type) {
			case BlockCreator.VIEW_BLOCK:
				payload.editable = false;
				payload.deletable = false;
				payload.leftPins = createPins([white]);
				break;
			case BlockCreator.CREATABLE_TYPES.VALUE_BLOCK:
				payload.changeable = false;
				payload.rightPins = createPins([purple]);
				break;
			default:
				break;
		}

		return state.push(new Block(payload));
	},
	[actions.updateBlock]: (state, action) => {
		const { payload: { id, patch } } = action;

		return state.updateIn([id], (block) => block.merge(patch));
	},
	[actions.deleteBlock]: (state, action) => {
		const { payload } = action;

		return state.filter((a, i) => i !== payload);
	},
	[actions.deltaMoveBlock]: (state, action) => {
		const { payload: { id, dx, dy } } = action;

		return state.map((a, i) => i === id ? a.dmove(dx, dy) : a);
	},
	[actions.addPin]: (state, action) => {
		const { payload } = action;

		return state.updateIn([payload], (block) => block.updateIn(['leftPins'], (leftPins) => leftPins.push(new Pin({ id: leftPins.size, color: white }))));
	},
	[actions.deletePin]: (state, action) => {
		const { payload } = action;

		return state.updateIn([payload], (block) => block.updateIn(['leftPins'], (leftPins) => leftPins.slice(0, Math.max(1, leftPins.size - 1))));
	}
}, List());