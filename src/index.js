'use strict';

const Chain = require('./chain.js');
const ace = require('brace');
require('brace/mode/html');
require('brace/theme/clouds_midnight');

const modes = ['#chain-canvas', '#chain-html', '#chain-window'];
const elements = modes.map((a) => document.querySelector(a));
const editor = ace.edit('chain-html');
const chain = new Chain(editor, elements[2]);

//set default value of editor
editor.getSession().setValue([
	'<!doctype html>',
	'<html>',
	'<head>',
	'',
	'</head>',
	'<body>',
	'	<h1>Hello, World!</h1>',
	'</body>',
	'</html>'
].join('\n'));
editor.getSession().setMode('ace/mode/html');
editor.setTheme('ace/theme/clouds_midnight');

const changeMode = () => {
	const hash = location.hash;
	elements.forEach((a) => a.style.display = 'none');
	const index = Math.max(modes.indexOf(hash), 0);
	elements[index].style.display = '';
	chain.updateFrame();
};

setTimeout(changeMode, 0);
window.addEventListener('hashchange', changeMode);