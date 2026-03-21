import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { getSession, listDownloads } from '../lib/api';
import { buildDownloadLookup } from '../lib/tracks';

function useAppState() {
  const [user, setUser] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoaded, setDownloadsLoaded] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [notice, setNotice] = useState(null);
  const previewAudioRef = useRef(null);
  const previewResetRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const data = await getSession();

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

  function resetPreviewControls() {
    if (previewResetRef.current) {
      previewResetRef.current();
      previewResetRef.current = null;
    }
  }

  function stopPreview() {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }

    resetPreviewControls();
  }

  useEffect(() => stopPreview, []);

  useEffect(() => {
    stopPreview();
  }, [location.pathname]);

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
    previewResetRef.current = controls.reset;
    controls.setLabel('Pause');

    audio.addEventListener('ended', () => {
      stopPreview();
    });

    audio.play().catch(() => {
      stopPreview();
    });
  }

  async function refreshDownloads() {
    const nextDownloads = await listDownloads();
    setDownloads(nextDownloads);
    setDownloadsLoaded(true);
    return nextDownloads;
  }

  const { downloadedTrackKeys, downloadedTrackMap } = buildDownloadLookup(downloads);

  return {
    user,
    sessionStatus,
    downloads,
    downloadsLoaded,
    playlist,
    notice,
    downloadedTrackKeys,
    downloadedTrackMap,
    refreshDownloads,
    setPlaylist,
    setNotice,
    clearNotice: () => setNotice(null),
    stopPreview,
    togglePreview
  };
}

export default useAppState;
