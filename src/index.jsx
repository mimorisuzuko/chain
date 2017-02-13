const React = require('react');
const ReactDOM = require('react-dom');
const {Component} = React;

require('./index.scss');

class App extends Component {
	render() {
		return (
			<div>
				Hello
			</div>
		);
	}
}

const $main = document.querySelector('main');
ReactDOM.render(<App />, $main);