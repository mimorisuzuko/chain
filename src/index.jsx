import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import { createStore } from 'redux';
import state from './reducers';
import './index.scss';

const store = createStore(state);

render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.querySelector('main')
);