const axios = require('axios');

async function searchArtists(query) {
  const { data } = await axios.get(`https://api.deezer.com/search/artist?q=${query}`);
  return data.data;
}

async function getArtistAlbums(artistId) {
  const { data } = await axios.get(`https://api.deezer.com/artist/${artistId}/albums`);
  return data.data;
}

async function getAlbumDetails(albumId) {
  const { data } = await axios.get(`https://api.deezer.com/album/${albumId}`);
  return data;
}

module.exports = {
  searchArtists,
  getArtistAlbums,
  getAlbumDetails
};
