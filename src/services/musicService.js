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

async function searchTracks(query) {
  const { data } = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
  return data.data || [];
}

async function matchTrackSuggestion(title, artist) {
  const exactishQuery = `artist:"${artist}" track:"${title}"`;
  let tracks = await searchTracks(exactishQuery);

  if (!tracks.length) {
    tracks = await searchTracks(`${artist} ${title}`);
  }

  if (!tracks.length) {
    return null;
  }

  const loweredTitle = title.toLowerCase();
  const loweredArtist = artist.toLowerCase();
  const preferredMatch = tracks.find(track =>
    track.title.toLowerCase().includes(loweredTitle) &&
    track.artist?.name?.toLowerCase().includes(loweredArtist)
  );

  return preferredMatch || tracks[0];
}

module.exports = {
  searchArtists,
  getArtistAlbums,
  getAlbumDetails,
  matchTrackSuggestion
};
