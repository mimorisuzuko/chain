import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../actions';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/addon/selection/active-line';
import autobind from 'autobind-decorator';

@connect(
	({ htmlEditor }) => ({
		code: htmlEditor
	})
)
export default class HTMLRenderer extends Component {
	@autobind
	onChange(code) {
		const { props: { dispatch } } = this;

		dispatch(actions.onChangeHtml(code));
	}

	render() {
		const { props: { code } } = this;

		return (
			<CodeMirror value={code} onChange={this.onChange} options={{
				mode: 'htmlmixed',
				theme: 'monokai',
				styleActiveLine: true,
				lineNumbers: true
			}}
			/>
		);
	}
}
