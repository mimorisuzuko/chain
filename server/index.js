const express = require('express');
const libpath = require('path');
const app = express();
const io = require('socket.io').listen(app.listen(6280));
const stateManager = require('./state-manager');
const cors = require('cors');
const _ = require('lodash');

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

	socket.on('patch', (args) => {
		_.forEach(['blocks', 'links'], (key) => {
			_.forEach(args[key], ({ op, path: strpath, value }) => {
				const path = _.split(strpath.substring(1), '/');
				const { length } = path;

				if (length > 0) {
					path[0] = _.parseInt(path[0]);
				}

				if (key === 'blocks') {
					if (length > 2) {
						path[2] = _.parseInt(path[2]);
					}
				}

				if (op === 'add' || op === 'replace') {
					stateManager.setStateFromBrowser(key, path, value);
				} else if (op === 'remove') {
					stateManager.setStateFromBrowser(key, path, value);
				}
			});
		});
	});

	socket.on('disconnect', () => {
		stateManager.deleteMouse(id);
		io.emit('mouse', stateManager.toJS('mouse'));
	});
});