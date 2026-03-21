import { useState } from 'react';

import AppShell from '../components/AppShell';
import PlaylistResults from '../components/PlaylistResults';
import { generatePlaylist } from '../lib/api';
import { PLAYLIST_PROMPT_PRESETS } from '../lib/constants';

function AiPlaylistPage({ appState }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGeneratePlaylist() {
    if (!prompt.trim()) {
      appState.setNotice('Please enter a playlist prompt first.');
      return;
    }

    setIsGenerating(true);

    try {
      await appState.refreshDownloads();
      const nextPlaylist = await generatePlaylist(prompt.trim());
      appState.setPlaylist(nextPlaylist);
      await appState.refreshDownloads();
    } catch (error) {
      appState.setNotice(error.message);
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
          {PLAYLIST_PROMPT_PRESETS.map(preset => (
            <button
              key={preset.label}
              type="button"
              className="tip-chip"
              onClick={() => setPrompt(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="actions">
          <button type="button" onClick={handleGeneratePlaylist} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Playlist'}
          </button>
        </div>
      </div>
      <PlaylistResults appState={appState} />
    </AppShell>
  );
}

export default AiPlaylistPage;
