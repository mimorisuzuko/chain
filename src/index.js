'use strict';

const Chain = require('./chain.js');
const ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/clouds_midnight');

const chain = new Chain();
const editor = ace.edit('chain-code');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/clouds_midnight');

const modes = ['#chain-canvas', '#chain-code'].map((a) => document.querySelector(a));

const changeMode = () => {
	const hash = location.hash.slice(1);
	if (hash === 'chain-canvas') {
		chain.plugin = editor.getValue();
	}
	if (modes.map((mode) => mode.style.display = (mode.id === hash) ? '' : 'none').includes('')) {
		return;
	}
	modes[0].style.display = '';
};

setTimeout(changeMode, 0);
window.addEventListener('hashchange', changeMode);