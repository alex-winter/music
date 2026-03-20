const musicService = require('../services/musicService');

async function searchArtists(req, res) {
  try {
    const artists = await musicService.searchArtists(req.query.q);
    res.json(artists);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Search failed' });
  }
}

async function getArtistAlbums(req, res) {
  try {
    const albums = await musicService.getArtistAlbums(req.params.id);
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: 'Albums fetch failed' });
  }
}

async function getAlbumDetails(req, res) {
  try {
    const album = await musicService.getAlbumDetails(req.params.id);
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: 'Album fetch failed' });
  }
}

module.exports = {
  searchArtists,
  getArtistAlbums,
  getAlbumDetails
};
