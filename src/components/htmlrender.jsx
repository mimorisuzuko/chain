const React = require('react');
const _ = require('lodash');
const Immutable = require('immutable');
const {Component} = React;
const {Map} = Immutable;

class HTMLRenderer extends Component {
	shouldComponentUpdate(nextProps) {
		const {props} = this;

		return !Immutable.is(Map(props), Map(nextProps));
	}

	render() {
		const {props: {html, style}} = this;

		return (
			<iframe srcDoc={html} style={_.assign(style, {
				display: 'block',
				width: '100%',
				height: '100%',
				border: 'none'
			})} />
		);
	}
}

module.exports = { HTMLRenderer };