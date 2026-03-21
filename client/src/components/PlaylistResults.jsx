import { useEffect, useState } from 'react';

import { downloadTrack } from '../lib/api';
import { getTrackKey } from '../lib/tracks';

function PlaylistResults({ appState }) {
  const { playlist } = appState;

  if (!playlist) {
    return null;
  }

  return (
    <div className="playlist-result">
      <div className="playlist-summary">
        <h2>{playlist.title}</h2>
        <p>{playlist.description}</p>
        {playlist.autoAddedFirstTrack ? (
          <p className="track-meta">The first song was automatically added to your library.</p>
        ) : null}
      </div>
      {playlist.songs.map((song, index) => (
        <PlaylistSongCard
          key={`${song.artist}-${song.title}-${index}`}
          song={song}
          index={index}
          appState={appState}
        />
      ))}
    </div>
  );
}

function PlaylistSongCard({ song, index, appState }) {
  const matchedTrack = song.matchedTrack;
  const inLibrary = matchedTrack
    ? appState.downloadedTrackKeys.has(getTrackKey(matchedTrack))
    : false;
  const [sampleLabel, setSampleLabel] = useState('Sample');
  const [libraryLabel, setLibraryLabel] = useState(inLibrary ? 'Added' : 'Add');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setLibraryLabel(inLibrary ? 'Added' : 'Add');
  }, [inLibrary]);

  function createSampleControls() {
    return {
      isCurrent: () => sampleLabel === 'Pause' || sampleLabel === 'Resume',
      setLabel: setSampleLabel,
      reset: () => setSampleLabel('Sample')
    };
  }

  async function addTrackToLibrary() {
    if (!matchedTrack || inLibrary) {
      return;
    }

    setIsAdding(true);
    setLibraryLabel('Adding');

    try {
      await downloadTrack(matchedTrack);
      await appState.refreshDownloads();
      setLibraryLabel('Added');
    } catch (error) {
      appState.setNotice(error.message);
      setLibraryLabel('Add');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="playlist-song">
      <div className="playlist-song-head">
        <div>
          <h3>{index + 1}. {song.title}</h3>
          <div className="track-meta">{song.artist}</div>
        </div>
        <div className="track-actions">
          <span className="track-status" hidden={!inLibrary}>In Library</span>
          <button
            type="button"
            className="secondary"
            onClick={() => matchedTrack?.preview && appState.togglePreview(matchedTrack.preview, createSampleControls())}
            disabled={!matchedTrack?.preview}
          >
            {sampleLabel}
          </button>
          <button type="button" className="secondary" onClick={addTrackToLibrary} disabled={!matchedTrack || inLibrary || isAdding}>
            {libraryLabel}
          </button>
        </div>
      </div>
      <p className="playlist-reason">{song.reason || 'Fits the overall prompt and mood.'}</p>
      <div className="track-meta">
        {matchedTrack
          ? `Matched in Deezer: ${matchedTrack.title} - ${matchedTrack.artist.name}`
          : 'No Deezer-backed match was found for this recommendation.'}
      </div>
    </div>
  );
}

export default PlaylistResults;
