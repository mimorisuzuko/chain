const { Map, List, fromJS } = require('immutable');
const _ = require('lodash');

class StateManager {
	constructor() {
		this.state = Map({
			mouse: Map(),
			blocks: List(),
			links: List()
		});
	}

	/**
	 * @param {string} key
	 * @returns {{}}
	 */
	toJS(key) {
		const { state } = this;
		return state.get(key).toJS();
	}

	/**
	 * @param {string} id
	 */
	addMouse(id) {
		const { state } = this;
		this.state = state.setIn(['mouse', id], Map({ x: 0, y: 0 }));
	}

	/**
	 * @param {string} id
	 * @param {{}} query
	 */
	updateMouse(id, query) {
		const { state } = this;
		this.state = state.updateIn(['mouse', id], (mouse) => mouse.merge(query));
	}

	/**
	 * @param {string} id
	 */
	deleteMouse(id) {
		const { state } = this;
		this.state = state.deleteIn(['mouse', id]);
	}

	/**
	 * @param {string} target
	 * @param {(number|string)[]} key
	 * @param {any} value
	 */
	setStateFromBrowser(target, key, value) {
		const { state } = this;
		this.state = state.setIn([target, ...key], _.isObject(value) ? fromJS(value) : value);
	}

	/**
	 * @param {string} target
	 * @param {(number|string)[]} key
	 */
	deleteStateFromBrowser(target, key) {
		const { state } = this;
		this.state = state.deleteIn([target, ...key]);
	}
}

module.exports = new StateManager();