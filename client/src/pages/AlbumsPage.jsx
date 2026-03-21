import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AppShell from '../components/AppShell';
import { getArtistAlbums } from '../lib/api';

function AlbumsPage({ appState }) {
  const { artistId } = useParams();
  const location = useLocation();
  const [artist, setArtist] = useState(location.state?.artist || null);
  const [albums, setAlbums] = useState([]);
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      try {
        const data = await getArtistAlbums(artistId);

        if (!cancelled) {
          setAlbums(data);
          if (location.state?.artist) {
            setArtist(location.state.artist);
          } else if (data[0]?.artist) {
            setArtist(data[0].artist);
          }
          setStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadAlbums();

    return () => {
      cancelled = true;
    };
  }, [artistId, location.state]);

  return (
    <AppShell
      user={appState.user}
      title={artist?.name || 'Albums'}
      description="Open an album to sample tracks and add songs to your library."
    >
      {status === 'loading' ? <div className="empty">Loading albums...</div> : null}
      {status === 'error' ? <div className="empty">Albums could not be loaded right now.</div> : null}
      {status === 'ready' ? (
        <div className="album-grid">
          {albums.map(album => (
            <button
              key={album.id}
              type="button"
              className="album card-button"
              onClick={() => navigate(`/album/${album.id}`, { state: { album } })}
            >
              <img src={album.cover_medium} alt={album.title} />
              <div>{album.title}</div>
            </button>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}

export default AlbumsPage;
