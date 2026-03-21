function getTrackKey(track) {
  return `${track.artist.name} - ${track.title}`
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
}

function buildDownloadLookup(downloads) {
  return {
    downloadedTrackKeys: new Set(downloads.map(file => file.trackKey)),
    downloadedTrackMap: new Map(downloads.map(file => [file.trackKey, file]))
  };
}

function isTrackInLibrary(track, downloadedTrackKeys) {
  return downloadedTrackKeys.has(getTrackKey(track));
}

export {
  buildDownloadLookup,
  getTrackKey,
  isTrackInLibrary
};
