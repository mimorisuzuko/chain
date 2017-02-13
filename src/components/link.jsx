const React = require('react');
const {Component} = React;

class Link extends Component {
	render() {
		const {props: {from, to}} = this;

		return <polyline points={[from, to]} fill='none' strokeWidth={3} stroke='white' />;
	}
}

module.exports = { Link };