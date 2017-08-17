const { Map } = require('immutable');

class StateManager {
	constructor() {
		this.state = Map({
			mouse: Map()
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
}

module.exports = new StateManager();