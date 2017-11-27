import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import autobind from 'autobind-decorator';

class IndentTextarea extends Component {
	constructor() {
		super();

		this.tab = false;
		this.selectionStart = -1;
	}

	componentDidUpdate() {
		const { selectionStart } = this;

		if (-1 < selectionStart) {
			const caret = selectionStart + 1;
			ReactDOM.findDOMNode(this).setSelectionRange(caret, caret);
		}

		this.selectionStart = -1;
	}

	@autobind
	onKeyDown(...args) {
		const { props: { onKeyDown } } = this;
		const { keyCode, currentTarget: { selectionStart } } = args[0];

		if (keyCode === 9) {
			this.selectionStart = selectionStart;
		}

		if (typeof onKeyDown === 'function') {
			onKeyDown(...args);
		}
	}

	render() {
		const { props: prev } = this;
		const props = _.cloneDeep(prev);
		delete props.onKeyDown;

		return <textarea {...props} onKeyDown={this.onKeyDown} />;
	}
}

export default IndentTextarea;
