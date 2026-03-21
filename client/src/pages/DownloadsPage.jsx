import { useEffect, useState } from 'react';

import AppShell from '../components/AppShell';
import { formatFileMetadata } from '../lib/formatters';

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

export default DownloadsPage;
