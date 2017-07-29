import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import { createStore } from 'redux';
import state from './reducers';
import actions from './actions';
import './index.scss';

const store = createStore(state);

store.dispatch(actions.addBlock({ value: '', x: 100, y: 100, editable: false, deletable: false }));

render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.querySelector('main')
);