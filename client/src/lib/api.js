async function requestJson(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Request failed');
  }

  return response.json();
}

function getSession() {
  return requestJson('/auth/session');
}

function searchArtists(query) {
  return requestJson(`/api/search?q=${encodeURIComponent(query)}`);
}

function getArtistAlbums(artistId) {
  return requestJson(`/api/artist/${artistId}/albums`);
}

function getAlbumDetails(albumId) {
  return requestJson(`/api/album/${albumId}`);
}

function listDownloads() {
  return requestJson('/api/downloads');
}

function downloadAlbum(tracks) {
  return requestJson('/api/download-album', {
    method: 'POST',
    body: JSON.stringify({ tracks })
  });
}

function downloadTrack(track) {
  return requestJson('/api/download-track', {
    method: 'POST',
    body: JSON.stringify({ track })
  });
}

function generatePlaylist(prompt) {
  return requestJson('/api/ai/playlist', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
}

export {
  downloadAlbum,
  downloadTrack,
  generatePlaylist,
  getAlbumDetails,
  getArtistAlbums,
  getSession,
  listDownloads,
  requestJson,
  searchArtists
};
