const express = require('express');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

// 🔍 Search artists (Deezer)
app.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    const { data } = await axios.get(`https://api.deezer.com/search/artist?q=${q}`);
    res.json(data.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 🎤 Get artist albums
app.get('/artist/:id/albums', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.deezer.com/artist/${req.params.id}/albums`);
    res.json(data.data);
  } catch (err) {
    res.status(500).json({ error: 'Albums fetch failed' });
  }
});

// 💿 Get album details
app.get('/album/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.deezer.com/album/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Album fetch failed' });
  }
});

// ⬇️ Download album using yt-dlp
app.post('/download-album', async (req, res) => {
  try {
    const tracks = req.body.tracks;

    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Invalid tracks data' });
    }

    for (const track of tracks) {
      try {
        const query = `${track.artist.name} - ${track.title}`;
        const search = await yts(query);

        const video = search.videos.find(v =>
          v.seconds > 30 &&
          v.seconds < 600 &&
          v.title.toLowerCase().includes(track.title.toLowerCase())
        );

        if (!video) {
          console.log(`No video found for ${query}`);
          continue;
        }

        const safeName = `${track.artist.name} - ${track.title}`
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();

        const outputPath = path.join(DOWNLOAD_DIR, safeName);

        const command = `"C:\\Users\\ajwin\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe" --js-runtimes node:"C:\\Program Files\\nodejs\\node.exe" -x --audio-format mp3 -o "${outputPath}.%(ext)s" "${video.url}"`;

        console.log(`Downloading: ${query}`);

        await new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error downloading ${query}`, stderr);
              return resolve(); // skip instead of crash
            }
            resolve();
          });
        });

      } catch (err) {
        console.error(`Track failed: ${track.title}`, err.message);
      }
    }

    res.json({ status: 'done' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Download failed' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});