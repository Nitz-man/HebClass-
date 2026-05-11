// Character registry for HebrewClass.
// Each character is an ORIGINAL design (no IP risk — explicitly NOT named
// after Italian Brainrot TikTok memes). The brainrot energy lives in the
// silly Israeli-food-themed concept, not in copied likenesses.
//
// `lottieUrl` is optional. When empty, the AvatarCharacter component falls
// back to a CSS-animated emoji avatar — visually complete out of the box.
// To upgrade to real 3D-style animated characters: commission Lottie files
// (After Effects, Rive, or LottieFiles marketplace) and paste URLs here.
//
// `id` is what we persist on the user record. Don't rename ids after a
// character has been picked by a real user — add new ones instead.

const CHARACTERS = [
  {
    id: 'bagelo',
    name: 'Bagelo',
    tagline: 'Disco bagel with main-character energy',
    emoji: '🥯',
    accent: '✨',
    animation: 'breakdance',
    gradient: ['#fcd9b0', '#a06236'],
    lottieUrl: '',
  },
  {
    id: 'falafini',
    name: 'Falafini',
    tagline: 'Falafel wizard, casts crispy spells',
    emoji: '🧆',
    accent: '🪄',
    animation: 'wobble',
    gradient: ['#8fcf63', '#c89b1a'],
    lottieUrl: '',
  },
  {
    id: 'shawarmacho',
    name: 'Shawarmacho',
    tagline: 'Wraps tighter than your homework deadline',
    emoji: '🌯',
    accent: '🕶️',
    animation: 'shimmy',
    gradient: ['#e85d3c', '#f6b65a'],
    lottieUrl: '',
  },
  {
    id: 'hummizilla',
    name: 'Hummizilla',
    tagline: 'Friendly chickpea monster, hungry for verbs',
    emoji: '😋',
    accent: '🫘',
    animation: 'thump',
    gradient: ['#e8d8a8', '#7a9a4e'],
    lottieUrl: '',
  },
  {
    id: 'tomatatron',
    name: 'Tomatatron 3000',
    tagline: 'Robot tomato from the future of salads',
    emoji: '🍅',
    accent: '🤖',
    animation: 'glitch',
    gradient: ['#ff5a3a', '#b9c2cc'],
    lottieUrl: '',
  },
  {
    id: 'camelius',
    name: 'Camelius Maximus',
    tagline: 'Swole desert camel, lifts vowels for fun',
    emoji: '🐪',
    accent: '💪',
    animation: 'flex',
    gradient: ['#d6a96b', '#9e7bd4'],
    lottieUrl: '',
  },
  {
    id: 'chickito',
    name: 'Chickito',
    tagline: 'Hatches every time you get an answer right',
    emoji: '🐣',
    accent: '🥚',
    animation: 'hatch',
    gradient: ['#ffe16a', '#ff9ec4'],
    lottieUrl: '',
  },
  {
    id: 'sabro',
    name: 'Sabro the Cactus King',
    tagline: 'Prickly on the outside, vowel-rich on the inside',
    emoji: '🌵',
    accent: '👑',
    animation: 'sway',
    gradient: ['#5cb27a', '#e4c14a'],
    lottieUrl: '',
  },
];

export const charactersById = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

export const getCharacter = (id) => charactersById[id] || CHARACTERS[0];

export default CHARACTERS;
