import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import { createStore } from 'redux';
import state from './reducers';
import { enableBatching } from 'redux-batched-actions';
import './index.scss';

const store = createStore(enableBatching(state));

render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.querySelector('main')
);