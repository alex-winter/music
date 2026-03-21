import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import AppShell from '../components/AppShell';
import TrackRow from '../components/TrackRow';
import { downloadAlbum, getAlbumDetails } from '../lib/api';

function AlbumPage({ appState }) {
  const { albumId } = useParams();
  const location = useLocation();
  const [album, setAlbum] = useState(location.state?.album || null);
  const [status, setStatus] = useState('loading');
  const [albumActionStatus, setAlbumActionStatus] = useState('idle');

  useEffect(() => {
    let cancelled = false;

    async function loadAlbum() {
      try {
        const data = await getAlbumDetails(albumId);

        if (!cancelled) {
          setAlbum(data);
          setStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadAlbum();
    appState.refreshDownloads().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [albumId]);

  async function addAlbumToLibrary() {
    if (!album?.tracks?.data?.length) {
      return;
    }

    setAlbumActionStatus('loading');

    try {
      await downloadAlbum(album.tracks.data);
      await appState.refreshDownloads();
      setAlbumActionStatus('done');
    } catch (error) {
      appState.setNotice(error.message);
      setAlbumActionStatus('idle');
    }
  }

  return (
    <AppShell
      user={appState.user}
      title={album?.title || 'Album'}
      description="Sample tracks and add the ones you want to your library."
    >
      {status === 'loading' ? <div className="empty">Loading tracks...</div> : null}
      {status === 'error' ? <div className="empty">Album details could not be loaded right now.</div> : null}
      {status === 'ready' && album ? (
        <>
          <img className="cover" src={album.cover_medium} alt={album.title} />
          <div className="track-list">
            {album.tracks.data.map((track, index) => (
              <TrackRow
                key={`${track.id || track.title}-${index}`}
                track={track}
                index={index}
                appState={appState}
              />
            ))}
          </div>
          <div className="actions section-actions">
            <button type="button" onClick={addAlbumToLibrary} disabled={albumActionStatus === 'loading'}>
              {albumActionStatus === 'loading' ? 'Adding Album...' : albumActionStatus === 'done' ? 'Album Added' : 'Add Album To Library'}
            </button>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}

export default AlbumPage;
