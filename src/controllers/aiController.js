const aiPlaylistService = require('../services/aiPlaylistService');
const downloadService = require('../services/downloadService');

async function generatePlaylist(req, res) {
  try {
    const prompt = req.body?.prompt?.trim();

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const playlist = await aiPlaylistService.generatePlaylistFromPrompt(prompt);
    const firstTrack = playlist.songs[0]?.matchedTrack;
    let firstTrackAdded = false;

    if (firstTrack) {
      firstTrackAdded = await downloadService.downloadTrack(firstTrack);
    }

    playlist.autoAddedFirstTrack = firstTrackAdded;

    return res.json(playlist);
  } catch (error) {
    console.error(error.message);

    if (error.message === 'GROQ_API_KEY is not configured') {
      return res.status(503).json({ error: 'AI playlist generation is not configured yet' });
    }

    if (error.message === 'The AI could not find any Deezer-backed songs for that prompt') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'AI playlist generation failed' });
  }
}

module.exports = {
  generatePlaylist
};
