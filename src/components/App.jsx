import React from 'react';
import { Provider } from 'react-redux';
import Chain from '../containers/Chain';
import { createStore } from 'redux';
import state from '../reducers';
import { enableBatching } from 'redux-batched-actions';
import { HashRouter, Route, NavLink, Redirect } from 'react-router-dom';
import HTMLRenderer from '../containers/HTMLRenderer';
import HTMLEditor from '../containers/HTMLEditor';
import { BlockCreator } from '../models';
import actions from '../actions';
import Balloons from '../containers/Balloons';
import styles from './App.scss';

const store = createStore(enableBatching(state));
store.dispatch(actions.addBlock({ x: 100, y: 100, type: BlockCreator.VIEW_BLOCK }));

const redirectRender = () => <Redirect to='/chain' />;

const App = () => (
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
					<NavLink to='/chain' className={styles.link} activeClassName={styles.active}>
						<span>Chain</span>
					</NavLink>
					<NavLink to='/editor' className={styles.link} activeClassName={styles.active}>
						<span>Editor</span>
					</NavLink>
					<NavLink to='/view' className={styles.link} activeClassName={styles.active}>
						<span>View</span>
					</NavLink>
				</footer>
				<Balloons />
			</div>
		</HashRouter>
	</Provider>
);

export default App;