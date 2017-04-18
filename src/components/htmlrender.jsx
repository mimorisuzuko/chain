const React = require('react');
const { Component } = React;

class HTMLRenderer extends Component {
	render() {
		const { props: { html } } = this;

		return (
			<iframe srcDoc={html} style={{
				display: 'block',
				width: '100%',
				height: '100%',
				border: 'none'
			}} />
		);
	}
}

module.exports = { HTMLRenderer };