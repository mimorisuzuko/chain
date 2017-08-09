import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../actions';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/addon/selection/active-line';

export default connect(
	(state) => ({
		code: state.htmlEditor
	})
)(class HTMLRenderer extends Component {
	constructor() {
		super();

		this.onChange = this.onChange.bind(this);
	}

	render() {
		const { props: { code } } = this;

		return <CodeMirror value={code} onChange={this.onChange} options={{
			mode: 'htmlmixed',
			theme: 'monokai',
			styleActiveLine: true,
			lineNumbers: true
		}} />;
	}

	onChange(code) {
		const { props: { dispatch } } = this;

		dispatch(actions.onChangeHtml(code));
	}
});