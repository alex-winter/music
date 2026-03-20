const downloadService = require('../services/downloadService');

function listDownloads(req, res) {
  try {
    res.json(downloadService.getDownloadEntries());
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Downloads fetch failed' });
  }
}

async function downloadAlbum(req, res) {
  try {
    const { tracks } = req.body;

    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Invalid tracks data' });
    }

    await downloadService.downloadAlbum(tracks);
    res.json({ status: 'done' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Download failed' });
  }
}

async function downloadTrack(req, res) {
  try {
    const { track } = req.body;

    if (!track || !track.title || !track.artist || !track.artist.name) {
      return res.status(400).json({ error: 'Invalid track data' });
    }

    const downloaded = await downloadService.downloadTrack(track);

    if (!downloaded) {
      return res.status(404).json({ error: 'No matching video found' });
    }

    res.json({ status: 'done' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Track download failed' });
  }
}

module.exports = {
  listDownloads,
  downloadAlbum,
  downloadTrack
};
