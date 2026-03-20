const express = require('express');
const path = require('path');
const cors = require('cors');

require('./config/env');

const authRoutes = require('./routes/authRoutes');
const musicController = require('./controllers/musicController');
const downloadController = require('./controllers/downloadController');
const { DOWNLOAD_DIR } = require('./services/downloadService');
const requireAuth = require('./middleware/requireAuth');
const { createSessionMiddleware, configurePassport, passport } = require('./lib/auth');

const app = express();

configurePassport();

app.use(cors());
app.use(createSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use(authRoutes);
app.use('/media', requireAuth, express.static(DOWNLOAD_DIR));
app.use(requireAuth);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/search', musicController.searchArtists);
app.get('/artist/:id/albums', musicController.getArtistAlbums);
app.get('/album/:id', musicController.getAlbumDetails);
app.get('/downloads', downloadController.listDownloads);
app.post('/download-album', downloadController.downloadAlbum);
app.post('/download-track', downloadController.downloadTrack);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
