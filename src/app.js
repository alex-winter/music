const express = require('express');
const path = require('path');
const cors = require('cors');

require('./config/env');

const authRoutes = require('./routes/authRoutes');
const aiController = require('./controllers/aiController');
const musicController = require('./controllers/musicController');
const downloadController = require('./controllers/downloadController');
const { DOWNLOAD_DIR } = require('./services/downloadService');
const requireAuth = require('./middleware/requireAuth');
const { createSessionMiddleware, configurePassport, passport } = require('./lib/auth');

const app = express();
const clientDistDir = path.join(__dirname, '..', 'dist', 'client');
const clientIndexPath = path.join(clientDistDir, 'index.html');

configurePassport();

app.use(cors());
app.use(createSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use('/assets', express.static(path.join(clientDistDir, 'assets')));

app.use(authRoutes);
app.use('/media', requireAuth, express.static(DOWNLOAD_DIR));

app.get('/api/search', requireAuth, musicController.searchArtists);
app.get('/api/artist/:id/albums', requireAuth, musicController.getArtistAlbums);
app.get('/api/album/:id', requireAuth, musicController.getAlbumDetails);
app.get('/api/downloads', requireAuth, downloadController.listDownloads);
app.post('/api/download-album', requireAuth, downloadController.downloadAlbum);
app.post('/api/download-track', requireAuth, downloadController.downloadTrack);
app.post('/api/ai/playlist', requireAuth, aiController.generatePlaylist);

function sendClientApp(req, res) {
  return res.sendFile(clientIndexPath);
}

app.get('/', requireAuth, sendClientApp);
app.get('/downloads', requireAuth, sendClientApp);
app.get('/ai-playlist', requireAuth, sendClientApp);
app.get('/artist/:artistId/albums', requireAuth, sendClientApp);
app.get('/album/:albumId', requireAuth, sendClientApp);

module.exports = app;
