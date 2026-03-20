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

module.exports = {
  listDownloads,
  downloadAlbum
};
