const express = require('express');
const libpath = require('path');
const app = express();
const io = require('socket.io').listen(app.listen(6280));
const stateManager = require('./state-manager');
const cors = require('cors');

app.use(cors());
app.use('/', express.static(libpath.join(__dirname, '../client')));

app.get('/init', (req, res) => {
	res.json({
		blocks: stateManager.toJS('blocks'),
		links: stateManager.toJS('links')
	});
});

io.on('connection', (socket) => {
	const { id } = socket;
	stateManager.addMouse(id);

	socket.on('mouse', (args) => {
		stateManager.updateMouse(id, args);
		io.emit('mouse', stateManager.toJS('mouse'));
	});

	socket.on('set:state', ({ target, query: { keys, value } }) => {
		stateManager.setStateFromBrowser(target, keys, value);
	});

	socket.on('delete:state', ({ target, query: { keys, value } }) => {
		stateManager.deleteStateFromBrowser(target, keys, value);
	});

	socket.on('disconnect', () => {
		stateManager.deleteMouse(id);
		io.emit('mouse', stateManager.toJS('mouse'));
	});
});