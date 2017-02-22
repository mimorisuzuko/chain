const React = require('react');
const ReactDOM = require('react-dom');
const {Tab} = require('./components/tab');
const {Chain} = require('./components/chain');
const {HTMLRenderer} = require('./components/htmlrender');
const {Component} = React;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.state = { html: '', active: 0 };
		this.updateActiveTab = this.updateActiveTab.bind(this);
		this.updateHTMLRenderer = this.updateHTMLRenderer.bind(this);
	}

	render() {
		const {state: {html, active}} = this;

		return (
			<Tab names={['Chain', 'Result']} active={active} updateActiveTab={this.updateActiveTab}>
				<Chain updateHTMLRenderer={this.updateHTMLRenderer} />
				<HTMLRenderer html={html} />
			</Tab>
		);
	}

	/**
	 * @param {number} active
	 */
	updateActiveTab(active) {
		this.setState({ active });
	}

	/**
	 * @param {string} html
	 */
	updateHTMLRenderer(html) {
		this.setState({ html });
	}
}

ReactDOM.render(<App />, document.querySelector('main'));