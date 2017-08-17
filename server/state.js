const { Map } = require('immutable');
const _ = require('lodash');

let state = Map({
	mouse: Map()
});

module.exports = {
	/**
	 * @param {string|string[]} prev
	 * @returns {{}}
	 */
	toJS: (prev) => {
		const key = _.isArray(prev) ? prev : [prev];
		return state.getIn(key).toJS();
	},
	/**
	 * @param {string} id
	 */
	addMouse: (id) => {
		state = state.setIn(['mouse', id], Map({ x: 0, y: 0 }));
	},
	/**
	 * @param {string} id
	 * @param {{}} query
	 */
	updateMouse: (id, query) => {
		state = state.updateIn(['mouse', id], (mouse) => mouse.merge(query));
	},
	/**
	 * @param {string} id
	 */
	deleteMouse: (id) => {
		state = state.deleteIn(['mouse', id]);
	}
};