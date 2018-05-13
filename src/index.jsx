import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import './index.scss';
import 'react-toastify/dist/ReactToastify.min.css';

render(<App />, document.querySelector('main'));
