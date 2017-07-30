import { List } from 'immutable';
import { BlockCreator, Block, Pin } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';
import { white, lblue } from '../color';


export default handleActions({
	[actions.addBlock]: (state, action) => {
		const { payload } = action;

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

		return state.updateIn([payload], (block) => block.updateIn(['leftPins'], (leftPins) => leftPins.push(new Pin({ id: leftPins.size, color: block.type === BlockCreator.CREATABLE_TYPES.FUNCTION_BLOCK ? lblue : white }))));
	},
	[actions.deletePin]: (state, action) => {
		const { payload } = action;

		return state.updateIn([payload], (block) => block.updateIn(['leftPins'], (leftPins) => leftPins.slice(0, Math.max(1, leftPins.size - 1))));
	}
}, List([new Block({ x: 100, y: 100, type: BlockCreator.VIEW_BLOCK })]));