const PLAYLIST_PROMPT_PRESETS = [
  {
    label: 'Midnight Tokyo',
    value: 'songs for a rainy midnight train ride through Tokyo, warm synths, dreamy but not sleepy'
  },
  {
    label: 'Gym Energy',
    value: 'an energetic gym playlist with confident women in pop and electronic music'
  },
  {
    label: 'Golden Hour Drive',
    value: 'a golden hour road trip playlist that feels nostalgic, open, and cinematic'
  }
];

const NAV_ITEMS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'downloads', label: 'My Downloads', to: '/downloads' },
  { key: 'ai', label: 'AI Playlist', to: '/ai-playlist' }
];

export {
  NAV_ITEMS,
  PLAYLIST_PROMPT_PRESETS
};
