const express = require('express');

const aiController = require('../controllers/aiController');
const downloadController = require('../controllers/downloadController');
const musicController = require('../controllers/musicController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/search', musicController.searchArtists);
router.get('/artist/:id/albums', musicController.getArtistAlbums);
router.get('/album/:id', musicController.getAlbumDetails);
router.get('/downloads', downloadController.listDownloads);
router.post('/download-album', downloadController.downloadAlbum);
router.post('/download-track', downloadController.downloadTrack);
router.post('/ai/playlist', aiController.generatePlaylist);

module.exports = router;
