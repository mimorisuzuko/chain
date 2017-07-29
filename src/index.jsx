import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import { createStore } from 'redux';
import state from './reducers';
import actions from './actions';
import { BlockCreator } from './models';
import './index.scss';

const store = createStore(state);

store.dispatch(actions.addBlock({ value: '', x: 100, y: 100, type: BlockCreator.VIEW_BLOCK }));

render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.querySelector('main')
);