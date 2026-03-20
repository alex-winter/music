const express = require('express');
const path = require('path');
const cors = require('cors');

const musicController = require('./controllers/musicController');
const downloadController = require('./controllers/downloadController');
const { DOWNLOAD_DIR } = require('./services/downloadService');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/media', express.static(DOWNLOAD_DIR));

app.get('/search', musicController.searchArtists);
app.get('/artist/:id/albums', musicController.getArtistAlbums);
app.get('/album/:id', musicController.getAlbumDetails);
app.get('/downloads', downloadController.listDownloads);
app.post('/download-album', downloadController.downloadAlbum);
app.post('/download-track', downloadController.downloadTrack);

module.exports = app;
