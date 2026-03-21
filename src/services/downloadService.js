const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const { execFile } = require('child_process');

const DOWNLOAD_DIR = path.join(__dirname, '..', '..', 'downloads');
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.webm', '.wav', '.ogg'];

fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

function getTrackBaseName(artistName, trackTitle) {
  return `${artistName} - ${trackTitle}`
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
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
        trackKey: path.basename(entry.name, ext),
        url: `/media/${encodeURIComponent(entry.name)}`
      };
    })
    .filter(file => AUDIO_EXTENSIONS.includes(file.ext))
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
}

function isTrackDownloaded(track) {
  const trackKey = getTrackBaseName(track.artist.name, track.title);

  return fs.readdirSync(DOWNLOAD_DIR).some(fileName => {
    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);

    return AUDIO_EXTENSIONS.includes(ext) && baseName === trackKey;
  });
}

async function downloadTrack(track) {
  if (isTrackDownloaded(track)) {
    return true;
  }

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

  const outputPath = path.join(DOWNLOAD_DIR, getTrackBaseName(track.artist.name, track.title));
  console.log(`Downloading: ${query}`);

  return new Promise(resolve => {
    execFile('yt-dlp', [
      '-x',
      '--audio-format',
      'mp3',
      '-o',
      `${outputPath}.%(ext)s`,
      video.url
    ], (error, stdout, stderr) => {
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
  getDownloadEntries,
  getTrackBaseName,
  isTrackDownloaded
};
