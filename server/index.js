const express = require('express');
const libpath = require('path');
const app = express();

app.use('/', express.static(libpath.join(__dirname, '../client')));

app.listen(6280);