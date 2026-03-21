const express = require('express');
const path = require('path');

require('./config/env');

const { DOWNLOAD_DIR } = require('./services/downloadService');
const requireAuth = require('./middleware/requireAuth');
const { createSessionMiddleware, configurePassport, passport } = require('./lib/auth');
const apiRoutes = require('./routes/apiRoutes');
const createAppRoutes = require('./routes/appRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const clientDistDir = path.join(__dirname, '..', 'dist', 'client');
const clientIndexPath = path.join(clientDistDir, 'index.html');

configurePassport();

app.use(createSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use('/assets', express.static(path.join(clientDistDir, 'assets')));

app.use(authRoutes);
app.use('/media', requireAuth, express.static(DOWNLOAD_DIR));

function sendClientApp(req, res) {
  return res.sendFile(clientIndexPath);
}

app.use('/api', apiRoutes);
app.use(createAppRoutes(sendClientApp));

module.exports = app;
