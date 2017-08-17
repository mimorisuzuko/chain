const express = require('express');
const libpath = require('path');
const app = express();
const io = require('socket.io').listen(app.listen(6280));
const state = require('./state');

app.use('/', express.static(libpath.join(__dirname, '../client')));

io.on('connection', (socket) => {
	const { id } = socket;
	state.addMouse(id);
	socket.on('mouse', (args) => {
		state.updateMouse(id, args);
		io.emit('mouse', state.toJS('mouse'));
	});
	socket.on('disconnect', () => {
		state.deleteMouse(id);
		io.emit('mouse', state.toJS('mouse'));
	});
});