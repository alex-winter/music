import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../components/AppShell';
import { searchArtists } from '../lib/api';

function HomePage({ appState }) {
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    if (!query.trim()) {
      setArtists([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await searchArtists(query.trim());
        if (!cancelled) {
          setArtists(data.slice(0, 10));
        }
      } catch (error) {
        if (!cancelled) {
          setArtists([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <AppShell
      user={appState.user}
      title="Album Downloader"
      description="Search artists, preview tracks, and open your downloaded library."
      activeView="home"
      topSlot={(
        <>
          <input
            className="search-box"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search for an artist..."
            autoComplete="off"
          />
          {isSearching ? <div className="empty compact-empty">Searching artists...</div> : null}
        </>
      )}
    >
      <div className="results">
        {artists.map(artist => (
          <button
            key={artist.id}
            type="button"
            className="artist-card card-button"
            onClick={() => navigate(`/artist/${artist.id}/albums`, { state: { artist } })}
          >
            <img src={artist.picture_medium} alt={artist.name} />
            <div>{artist.name}</div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}

export default HomePage;
