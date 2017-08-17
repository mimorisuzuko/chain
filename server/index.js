const express = require('express');
const libpath = require('path');
const app = express();
const io = require('socket.io').listen(app.listen(6280));
const stateManager = require('./state-manager');

app.use('/', express.static(libpath.join(__dirname, '../client')));

io.on('connection', (socket) => {
	const { id } = socket;
	stateManager.addMouse(id);
	socket.on('mouse', (args) => {
		stateManager.updateMouse(id, args);
		io.emit('mouse', stateManager.toJS('mouse'));
	});
	socket.on('disconnect', () => {
		stateManager.deleteMouse(id);
		io.emit('mouse', stateManager.toJS('mouse'));
	});
});