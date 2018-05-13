import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Chain from '../containers/Chain';
import { createStore } from 'redux';
import state from '../reducers';
import { enableBatching, batchActions } from 'redux-batched-actions';
import { HashRouter, Route, NavLink, Redirect } from 'react-router-dom';
import HTMLRenderer from '../containers/HTMLRenderer';
import HTMLEditor from '../containers/HTMLEditor';
import { Pin } from '../models';
import actions from '../actions';
import { ToastContainer } from 'react-toastify';
import _ from 'lodash';
import { List } from 'immutable';
import { BLOCK } from '../constants/index';
import styles from './App.scss';

const { link, active } = styles;
const store = createStore(enableBatching(state));
const stored = JSON.parse(localStorage.getItem('storedState'));

if (stored) {
	const { blocks, links } = stored;
	const { length } = blocks;

	if (length > 0) {
		store.dispatch(batchActions([
			..._.map(blocks, (block) => {
				_.forEach(['inputPins', 'outputPins'], (key) => {
					if (_.has(block, key)) {
						block[key] = List(_.map(block[key], (b) => new Pin(b)));
					}
				});

				return actions.addBlock(block);
			}),
			..._.map(links, (link) => actions.addPinLink(link))
		]));
	} else {
		store.dispatch(actions.addBlock({ x: 100, y: 100, type: BLOCK.TYPE_VIEW }));
	}
} else {
	store.dispatch(actions.addBlock({ x: 100, y: 100, type: BLOCK.TYPE_VIEW }));
}

const redirectRender = () => <Redirect to='/chain' />;

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<HashRouter>
					<div styleName='wrap'>
						<div styleName='base'>
							<HTMLRenderer />
							<Route exact path='/' render={redirectRender} />
							<Route path='/chain' component={Chain} />
							<Route path='/editor' component={HTMLEditor} />
						</div>
						<footer>
							<NavLink to='/chain' className={link} activeClassName={active}>
								<span>Chain</span>
							</NavLink>
							<NavLink to='/editor' className={link} activeClassName={active}>
								<span>Editor</span>
							</NavLink>
							<NavLink to='/view' className={link} activeClassName={active}>
								<span>View</span>
							</NavLink>
						</footer>
						<ToastContainer autoClose={3000} />
					</div>
				</HashRouter>
			</Provider>
		);
	}
}

export default App;
