const React = require('react');
const ReactDOM = require('react-dom');
const Immutable = require('immutable');
const { Tab } = require('./components/tab');
const { Chain } = require('./components/chain');
const { HTMLRenderer } = require('./components/htmlrender');
const { Balloon, BalloonModel } = require('./components/balloon');
const { Component } = React;
const { List } = Immutable;

require('./index.scss');

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			html: '',
			active: 0,
			balloons: List()
		};
		this.addBalloon = this.addBalloon.bind(this);
		this.balloonsLoop = this.balloonsAnimation.bind(this);
		this.removeBalloon = this.removeBalloon.bind(this);
		this.updateActiveTab = this.updateActiveTab.bind(this);
		this.updateHTMLRenderer = this.updateHTMLRenderer.bind(this);
	}

	balloonsAnimation() {
		const { state: { balloons } } = this;

		this.setState({
			balloons: balloons.map((a) => a.decrementLife()).filter((a) => a.get('life'))
		});

		requestAnimationFrame(this.balloonsLoop);
	}

	componentDidMount() {
		this.balloonsAnimation();
	}

	render() {
		const { state: { html, active, balloons } } = this;

		return (
			<div style={{
				width: '100%',
				height: '100%'
			}}>
				<Tab names={['Chain', 'Result']} active={active} updateActiveTab={this.updateActiveTab}>
					<Chain updateHTMLRenderer={this.updateHTMLRenderer} addBalloon={this.addBalloon} />
					<HTMLRenderer html={html} />
				</Tab>
				<div style={{
					position: 'fixed',
					right: 15,
					bottom: 15
				}}>
					{balloons.map((a, i) => <Balloon index={i} model={a} remove={this.removeBalloon} />)}
				</div>
			</div>
		);
	}

	/**
	 * @param {string} value
	 */
	addBalloon(value) {
		const { state: { balloons } } = this;
		const balloon = new BalloonModel({ value });

		this.setState({
			balloons: balloons.push(balloon)
		});
	}

	/**
	 * @param {number} index
	 */
	removeBalloon(index) {
		const { state: { balloons } } = this;

		this.setState({
			balloons: balloons.filter((a, i) => i !== index)
		});
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