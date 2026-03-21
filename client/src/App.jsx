import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
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

function getTrackKey(track) {
  return `${track.artist.name} - ${track.title}`
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
}

function formatFileMetadata(file) {
  const modifiedDate = new Date(file.modifiedAt).toLocaleString();
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  return `${file.ext.replace('.', '').toUpperCase()} • ${sizeMb} MB • ${modifiedDate}`;
}

function App() {
  const [user, setUser] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoaded, setDownloadsLoaded] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const previewAudioRef = useRef(null);
  const previewButtonResetRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch('/auth/session', { credentials: 'same-origin' });

        if (response.status === 401) {
          if (!cancelled) {
            setUser(null);
            setSessionStatus('guest');
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUser(data.user || null);
          setSessionStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setSessionStatus('guest');
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  useEffect(() => {
    stopPreview();
  }, [location.pathname]);

  function resetPreviewButton() {
    if (previewButtonResetRef.current) {
      previewButtonResetRef.current();
      previewButtonResetRef.current = null;
    }
  }

  function stopPreview() {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }

    resetPreviewButton();
  }

  function togglePreview(url, controls) {
    if (!url) {
      return;
    }

    const currentAudio = previewAudioRef.current;

    if (currentAudio && controls.isCurrent()) {
      if (currentAudio.paused) {
        currentAudio.play();
        controls.setLabel('Pause');
      } else {
        currentAudio.pause();
        controls.setLabel('Resume');
      }
      return;
    }

    stopPreview();

    const audio = new Audio(url);
    previewAudioRef.current = audio;
    previewButtonResetRef.current = controls.reset;
    controls.setLabel('Pause');

    audio.addEventListener('ended', () => {
      stopPreview();
    });

    audio.play().catch(() => {
      stopPreview();
    });
  }

  async function refreshDownloads() {
    const nextDownloads = await requestJson('/api/downloads', { headers: {} });
    setDownloads(nextDownloads);
    setDownloadsLoaded(true);
    return nextDownloads;
  }

  const downloadedTrackMap = useMemo(
    () => new Map(downloads.map(file => [file.trackKey, file])),
    [downloads]
  );

  const downloadedTrackKeys = useMemo(
    () => new Set(downloads.map(file => file.trackKey)),
    [downloads]
  );

  const appState = {
    user,
    sessionStatus,
    playlist,
    setPlaylist,
    downloads,
    downloadsLoaded,
    refreshDownloads,
    stopPreview,
    togglePreview,
    downloadedTrackKeys,
    downloadedTrackMap
  };

  if (sessionStatus === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          sessionStatus === 'ready'
            ? <Navigate to="/" replace />
            : <LoginPage />
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth sessionStatus={sessionStatus}>
            <HomePage appState={appState} />
          </RequireAuth>
        }
      />
      <Route
        path="/artist/:artistId/albums"
        element={
          <RequireAuth sessionStatus={sessionStatus}>
            <AlbumsPage appState={appState} />
          </RequireAuth>
        }
      />
      <Route
        path="/album/:albumId"
        element={
          <RequireAuth sessionStatus={sessionStatus}>
            <AlbumPage appState={appState} />
          </RequireAuth>
        }
      />
      <Route
        path="/downloads"
        element={
          <RequireAuth sessionStatus={sessionStatus}>
            <DownloadsPage appState={appState} />
          </RequireAuth>
        }
      />
      <Route
        path="/ai-playlist"
        element={
          <RequireAuth sessionStatus={sessionStatus}>
            <AiPlaylistPage appState={appState} />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={<Navigate to={sessionStatus === 'ready' ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

function RequireAuth({ children, sessionStatus }) {
  if (sessionStatus !== 'ready') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoadingScreen() {
  return (
    <div className="shell shell-centered">
      <section className="page">
        <div className="empty">Loading your library...</div>
      </section>
    </div>
  );
}

function AppShell({ user, title, description, activeView, children, topSlot }) {
  const avatarAlt = user?.displayName || user?.email || 'Signed in user';

  return (
    <div className="shell">
      <section className={activeView === 'home' ? 'hero' : 'page'}>
        <div className="session-bar">
          <div className="session-user">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt={avatarAlt} /> : null}
            <span>{user?.displayName || user?.email}</span>
          </div>
          <form method="POST" action="/auth/logout">
            <button type="submit" className="secondary">Log Out</button>
          </form>
        </div>
        <div className="page-head">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <TopNav activeView={activeView} />
        </div>
        {topSlot}
        {children}
      </section>
    </div>
  );
}

function TopNav({ activeView }) {
  return (
    <div className="actions">
      <Link className={activeView === 'home' ? 'button-link' : 'button-link secondary'} to="/">Home</Link>
      <Link className={activeView === 'downloads' ? 'button-link' : 'button-link secondary'} to="/downloads">My Downloads</Link>
      <Link className={activeView === 'ai' ? 'button-link' : 'button-link secondary'} to="/ai-playlist">AI Playlist</Link>
    </div>
  );
}

function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  return (
    <div className="shell login-shell">
      <section className="login-hero">
        <div className="eyebrow">Personal Music Workspace</div>
        <h1>Search, collect, and build playlists without the giant HTML file.</h1>
        <p className="hero-copy">
          Waveform now runs on a component-based frontend, so the product can keep growing without the UI logic turning into one long document.
        </p>
        <div className="hero-actions">
          <a className="button-link" href="/auth/google">Continue With Google</a>
        </div>
        {error ? (
          <div className="error-banner">Google sign-in failed. Please try again.</div>
        ) : null}
      </section>
    </div>
  );
}

function HomePage({ appState }) {
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    if (!query.trim()) {
      setArtists([]);
      return undefined;
    }

    setIsSearching(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await requestJson(`/api/search?q=${encodeURIComponent(query.trim())}`, { headers: {} });
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
      topSlot={
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
      }
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
        const data = await requestJson(`/api/artist/${artistId}/albums`, { headers: {} });
        if (!cancelled) {
          setAlbums(data);
          if (!artist && data[0]?.artist) {
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
  }, [artistId, artist]);

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
        const data = await requestJson(`/api/album/${albumId}`, { headers: {} });
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
      await requestJson('/api/download-album', {
        method: 'POST',
        body: JSON.stringify({ tracks: album.tracks.data })
      });
      await appState.refreshDownloads();
      setAlbumActionStatus('done');
    } catch (error) {
      window.alert(error.message);
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

function TrackRow({ track, index, appState }) {
  const defaultSampleLabel = 'Sample';
  const defaultLibraryLabel = appState.downloadedTrackKeys.has(getTrackKey(track)) ? 'Play' : 'Play';
  const [sampleLabel, setSampleLabel] = useState(defaultSampleLabel);
  const [libraryLabel, setLibraryLabel] = useState(defaultLibraryLabel);
  const [libraryBusy, setLibraryBusy] = useState(false);
  const inLibrary = appState.downloadedTrackKeys.has(getTrackKey(track));

  useEffect(() => {
    setLibraryLabel('Play');
  }, [inLibrary]);

  function sampleControls() {
    return {
      isCurrent: () => sampleLabel === 'Pause' || sampleLabel === 'Resume',
      setLabel: setSampleLabel,
      reset: () => setSampleLabel(defaultSampleLabel)
    };
  }

  function libraryControls() {
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
      let file = appState.downloadedTrackMap.get(getTrackKey(track));

      if (!file) {
        await requestJson('/api/download-track', {
          method: 'POST',
          body: JSON.stringify({ track })
        });
        const latestDownloads = await appState.refreshDownloads();
        file = latestDownloads.find(entry => entry.trackKey === getTrackKey(track));
      }

      if (!file) {
        throw new Error('Track is ready, but the file was not found');
      }

      appState.togglePreview(file.url, libraryControls());
    } catch (error) {
      window.alert(error.message);
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
          onClick={() => appState.togglePreview(track.preview, sampleControls())}
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

function DownloadsPage({ appState }) {
  const [status, setStatus] = useState(appState.downloadsLoaded ? 'ready' : 'loading');

  useEffect(() => {
    let cancelled = false;

    async function loadDownloads() {
      try {
        await appState.refreshDownloads();
        if (!cancelled) {
          setStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadDownloads();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      user={appState.user}
      title="My Downloads"
      description="Play anything already saved in your downloads folder."
      activeView="downloads"
    >
      {status === 'loading' ? <div className="empty">Loading downloads...</div> : null}
      {status === 'error' ? <div className="empty">Downloads could not be loaded right now.</div> : null}
      {status === 'ready' && !appState.downloads.length ? <div className="empty">No downloaded audio found yet.</div> : null}
      {status === 'ready' && appState.downloads.length ? (
        <div className="download-list">
          {appState.downloads.map(file => (
            <div key={file.url} className="download-card">
              <h3>{file.title}</h3>
              <div className="meta">{formatFileMetadata(file)}</div>
              <audio controls preload="none" src={file.url} />
            </div>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}

function AiPlaylistPage({ appState }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function generatePlaylist() {
    if (!prompt.trim()) {
      window.alert('Please enter a playlist prompt first.');
      return;
    }

    setIsGenerating(true);

    try {
      await appState.refreshDownloads();
      const nextPlaylist = await requestJson('/api/ai/playlist', {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      appState.setPlaylist(nextPlaylist);
      await appState.refreshDownloads();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AppShell
      user={appState.user}
      title="AI Playlist"
      description="Describe a mood, scene, memory, activity, or vibe, and the AI will build a playlist concept around it."
      activeView="ai"
    >
      <div className="prompt-panel">
        <textarea
          className="prompt-box"
          value={prompt}
          onChange={event => setPrompt(event.target.value)}
          placeholder="Try something like: songs for a rainy midnight train ride through Tokyo, warm synths, dreamy but not sleepy"
        />
        <div className="prompt-tips">
          <button type="button" className="tip-chip" onClick={() => setPrompt('songs for a rainy midnight train ride through Tokyo, warm synths, dreamy but not sleepy')}>Midnight Tokyo</button>
          <button type="button" className="tip-chip" onClick={() => setPrompt('an energetic gym playlist with confident women in pop and electronic music')}>Gym Energy</button>
          <button type="button" className="tip-chip" onClick={() => setPrompt('a golden hour road trip playlist that feels nostalgic, open, and cinematic')}>Golden Hour Drive</button>
        </div>
        <div className="actions">
          <button type="button" onClick={generatePlaylist} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Playlist'}
          </button>
        </div>
      </div>
      <PlaylistResults appState={appState} />
    </AppShell>
  );
}

function PlaylistResults({ appState }) {
  const playlist = appState.playlist;

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
  const inLibrary = matchedTrack ? appState.downloadedTrackKeys.has(getTrackKey(matchedTrack)) : false;
  const [sampleLabel, setSampleLabel] = useState('Sample');
  const [libraryLabel, setLibraryLabel] = useState(inLibrary ? 'Added' : 'Add');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setLibraryLabel(inLibrary ? 'Added' : 'Add');
  }, [inLibrary]);

  function sampleControls() {
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
      await requestJson('/api/download-track', {
        method: 'POST',
        body: JSON.stringify({ track: matchedTrack })
      });
      await appState.refreshDownloads();
      setLibraryLabel('Added');
    } catch (error) {
      window.alert(error.message);
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
            onClick={() => matchedTrack?.preview && appState.togglePreview(matchedTrack.preview, sampleControls())}
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
          ? `Matched in Deezer: ${matchedTrack.title} • ${matchedTrack.artist.name}`
          : 'No Deezer-backed match was found for this recommendation.'}
      </div>
    </div>
  );
}

export default App;
