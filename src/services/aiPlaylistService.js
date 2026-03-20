const axios = require('axios');

const env = require('../config/env');
const musicService = require('./musicService');

function stripJsonFences(text) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function generatePlaylistFromPrompt(prompt) {
  if (!env.groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: env.groqModel,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: [
            'You create music playlists from natural-language prompts.',
            'Return strict JSON only, with no markdown.',
            'Output shape:',
            '{"title":"string","description":"string","songs":[{"title":"string","artist":"string","reason":"string"}]}',
            'Return 8 songs.'
          ].join(' ')
        },
        {
          role: 'user',
          content: `Create a playlist for this prompt: ${prompt}`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${env.groqApiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const rawContent = response.data?.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('The AI service returned an empty response');
  }

  let parsed;

  try {
    parsed = JSON.parse(stripJsonFences(rawContent));
  } catch (error) {
    throw new Error('The AI service returned invalid playlist data');
  }

  const songs = Array.isArray(parsed.songs) ? parsed.songs.slice(0, 8) : [];
  const resolvedSongs = await Promise.all(
    songs.map(async song => {
      const matchedTrack = await musicService.matchTrackSuggestion(song.title, song.artist);

      return {
        title: song.title,
        artist: song.artist,
        reason: song.reason,
        matchedTrack
      };
    })
  );
  const matchedSongs = resolvedSongs.filter(song => song.matchedTrack);

  if (!matchedSongs.length) {
    throw new Error('The AI could not find any Deezer-backed songs for that prompt');
  }

  return {
    title: parsed.title || 'AI Playlist',
    description: parsed.description || prompt,
    songs: matchedSongs
  };
}

module.exports = {
  generatePlaylistFromPrompt
};
