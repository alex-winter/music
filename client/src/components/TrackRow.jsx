import { useEffect, useState } from 'react';

import { downloadTrack } from '../lib/api';
import { getTrackKey, isTrackInLibrary } from '../lib/tracks';

function TrackRow({ track, index, appState }) {
  const [sampleLabel, setSampleLabel] = useState('Sample');
  const [libraryLabel, setLibraryLabel] = useState('Play');
  const [libraryBusy, setLibraryBusy] = useState(false);
  const inLibrary = isTrackInLibrary(track, appState.downloadedTrackKeys);
  const trackKey = getTrackKey(track);

  useEffect(() => {
    setLibraryLabel('Play');
  }, [inLibrary]);

  function createSampleControls() {
    return {
      isCurrent: () => sampleLabel === 'Pause' || sampleLabel === 'Resume',
      setLabel: setSampleLabel,
      reset: () => setSampleLabel('Sample')
    };
  }

  function createLibraryControls() {
    return {
      isCurrent: () => libraryLabel === 'Pause' || libraryLabel === 'Resume',
      setLabel: setLibraryLabel,
      reset: () => setLibraryLabel('Play')
    };
  }

  async function playLibraryTrack() {
    setLibraryBusy(true);
    setLibraryLabel(inLibrary ? 'Play' : 'Preparing');

    try {
      let file = appState.downloadedTrackMap.get(trackKey);

      if (!file) {
        await downloadTrack(track);
        const latestDownloads = await appState.refreshDownloads();
        file = latestDownloads.find(entry => entry.trackKey === trackKey);
      }

      if (!file) {
        throw new Error('Track is ready, but the file was not found');
      }

      appState.togglePreview(file.url, createLibraryControls());
    } catch (error) {
      appState.setNotice(error.message);
      setLibraryLabel('Play');
    } finally {
      setLibraryBusy(false);
    }
  }

  return (
    <div className="track">
      <span>{index + 1}. {track.title}</span>
      <div className="track-actions">
        <span className="track-status" hidden={!inLibrary}>In Library</span>
        <button
          type="button"
          className="secondary"
          onClick={() => appState.togglePreview(track.preview, createSampleControls())}
          disabled={!track.preview}
        >
          {sampleLabel}
        </button>
        <button type="button" className="secondary" onClick={playLibraryTrack} disabled={libraryBusy}>
          {libraryLabel}
        </button>
      </div>
    </div>
  );
}

export default TrackRow;
