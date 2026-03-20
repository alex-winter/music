const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const { exec } = require('child_process');

const DOWNLOAD_DIR = path.join(__dirname, '..', '..', 'downloads');
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.webm', '.wav', '.ogg'];

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

function getDownloadEntries() {
  return fs
    .readdirSync(DOWNLOAD_DIR, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => {
      const filePath = path.join(DOWNLOAD_DIR, entry.name);
      const stats = fs.statSync(filePath);
      const ext = path.extname(entry.name).toLowerCase();

      return {
        name: entry.name,
        title: path.basename(entry.name, ext).replace(/_/g, ' '),
        ext,
        size: stats.size,
        modifiedAt: stats.mtimeMs,
        url: `/media/${encodeURIComponent(entry.name)}`
      };
    })
    .filter(file => AUDIO_EXTENSIONS.includes(file.ext))
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
}

async function downloadTrack(track) {
  const query = `${track.artist.name} - ${track.title}`;
  const search = await yts(query);

  const video = search.videos.find(v =>
    v.seconds > 30 &&
    v.seconds < 600 &&
    v.title.toLowerCase().includes(track.title.toLowerCase())
  );

  if (!video) {
    console.log(`No video found for ${query}`);
    return false;
  }

  const safeName = `${track.artist.name} - ${track.title}`
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();

  const outputPath = path.join(DOWNLOAD_DIR, safeName);
  const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}.%(ext)s" "${video.url}"`;

  console.log(`Downloading: ${query}`);

  return new Promise(resolve => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error downloading ${query}`, stderr);
        return resolve(false);
      }

      resolve(true);
    });
  });
}

async function downloadAlbum(tracks) {
  for (const track of tracks) {
    try {
      await downloadTrack(track);
    } catch (err) {
      console.error(`Track failed: ${track.title}`, err.message);
    }
  }
}

module.exports = {
  DOWNLOAD_DIR,
  downloadTrack,
  downloadAlbum,
  getDownloadEntries
};
