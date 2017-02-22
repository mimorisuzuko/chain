const React = require('react');
const _ = require('lodash');
const {blue, lblack, llblack} = require('../color');
const {Component} = React;

class Tab extends Component {
	constructor(props) {
		super(props);

		this.onClickItem = this.onClickItem.bind(this);
	}

	render() {
		const {HEIGHT: height} = Tab;
		const {props: {children: _children, names: _names, active}} = this;
		const names = _.map(_names, (a, i) => (
			<a href='#' data-index={i} onClick={this.onClickItem} style={{
				display: 'inline-block',
				fontSize: '1rem',
				padding: '5px 10px',
				borderBottom: `3px solid ${active === i ? blue : 'transparent'}`
			}}>
				{a}
			</a>
		)
		);
		const children = React.Children.map(_children, (child, i) => React.cloneElement(child, {
			style: {
				display: active === i ? 'block' : 'none'
			}
		})
		);

		return (
			<div style={{
				width: '100%',
				height: `calc(100% - ${height}px)`
			}}>
				{children}
				<footer style={{
					backgroundColor: lblack,
					position: 'fixed',
					left: 0,
					bottom: 0,
					borderTop: `1px solid ${llblack}`,
					width: '100%',
					height,
				}}>
					{names}
				</footer>
			</div>
		);
	}

	/**
	 * @param {MouseEvent} e
	 */
	onClickItem(e) {
		const {currentTarget: {dataset: {index}}} = e;
		const {props: {updateActiveTab}} = this;

		updateActiveTab(_.parseInt(index));
	}

	static get HEIGHT() {
		return 33;
	}
}

module.exports = { Tab };