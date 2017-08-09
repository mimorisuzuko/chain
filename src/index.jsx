import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Chain from './containers/Chain';
import { createStore } from 'redux';
import state from './reducers';
import { enableBatching } from 'redux-batched-actions';
import { HashRouter, Route, NavLink, Redirect } from 'react-router-dom';
import { black, white, blue, lblack } from './color';
import HTMLRenderer from './containers/HTMLRenderer';
import './index.scss';

const store = createStore(enableBatching(state));
const linkStyle = {
	borderBottomWidth: 3,
	borderBottomColor: 'transparent',
	borderBottomStyle: 'solid',
	padding: '5px 10px',
	display: 'inline-block'
};
const linkActiveStyle = {
	borderBottomColor: blue
};
const footerHeight = 31;
const redirectRender = () => <Redirect to='/chain' />;

render(
	<Provider store={store}>
		<HashRouter>
			<div style={{
				backgroundColor: black
			}}>
				<div style={{
					width: '100%',
					height: `calc(100% - ${footerHeight}px)`
				}}>
					<Route exact path='/' render={redirectRender} />
					<Route path='/chain' component={Chain} />
					<Route path='/view' component={HTMLRenderer} />
				</div>
				<footer style={{
					color: white,
					backgroundColor: lblack
				}}>
					<NavLink to='/chain' style={linkStyle} activeStyle={linkActiveStyle}>
						Chain
					</NavLink>
					<NavLink to='/view' style={linkStyle} activeStyle={linkActiveStyle}>
						View
					</NavLink>
				</footer>
			</div>
		</HashRouter>
	</Provider>
	, document.querySelector('main')
);