// Duolingo-style learning path for HebrewClass.
//
// The path is a list of UNITS. Each unit contains LESSONS (nodes on the
// path). A unit unlocks when the previous unit is complete; a lesson
// unlocks when the previous lesson in the same unit is complete.
//
// Each lesson maps to one of the existing games (quiz / memory / crossword)
// with a difficulty hint. Topic-based word filtering is a Phase 2 backend
// change — for now `topic` is metadata only and lessons draw from the
// full word bank at the given difficulty.
//
// `xpReward` is what the user earns for completing the lesson. Every 50 XP
// fills one segment of the level ring. Treasure lessons (final node of a
// unit) reward double XP.

const lesson = (id, title, game, difficulty, xpReward = 10, topic = null) => ({
  id,
  title,
  game,        // 'quiz' | 'memory' | 'crossword'
  difficulty,  // 1 | 2 | 3
  xpReward,
  topic,
  type: 'lesson',
});

const treasure = (id, title, game, difficulty, topic) => ({
  ...lesson(id, title, game, difficulty, 25, topic),
  type: 'treasure',
});

const UNITS = [
  {
    id: 'alefbet',
    title: 'Alef-Bet',
    titleHe: 'א״ב',
    description: 'Learn to recognize the Hebrew letters',
    color: '#6366f1',
    icon: '🔤',
    lessons: [
      lesson('alefbet-1', 'First letters', 'quiz', 1, 10, 'alefbet'),
      lesson('alefbet-2', 'More letters', 'memory', 1, 10, 'alefbet'),
      lesson('alefbet-3', 'Sounds & names', 'quiz', 1, 15, 'alefbet'),
      lesson('alefbet-4', 'Reading practice', 'memory', 1, 15, 'alefbet'),
      treasure('alefbet-5', 'Alef-Bet Champion', 'crossword', 1, 'alefbet'),
    ],
  },
  {
    id: 'family',
    title: 'Family',
    titleHe: 'משפחה',
    description: 'Words for the people you love',
    color: '#ec4899',
    icon: '👨‍👩‍👧',
    lessons: [
      lesson('family-1', 'Mom & Dad', 'quiz', 1, 10, 'family'),
      lesson('family-2', 'Brothers & Sisters', 'memory', 1, 10, 'family'),
      lesson('family-3', 'Grandparents', 'quiz', 2, 15, 'family'),
      lesson('family-4', 'All together', 'memory', 2, 15, 'family'),
      treasure('family-5', 'Family Tree', 'crossword', 2, 'family'),
    ],
  },
  {
    id: 'school',
    title: 'School',
    titleHe: 'בית ספר',
    description: 'Things in your classroom',
    color: '#0ea5e9',
    icon: '🎒',
    lessons: [
      lesson('school-1', 'Classroom items', 'quiz', 2, 10, 'school'),
      lesson('school-2', 'Notebook & pencil', 'memory', 2, 10, 'school'),
      lesson('school-3', 'Teacher & friend', 'quiz', 2, 15, 'school'),
      lesson('school-4', 'School day', 'memory', 2, 15, 'school'),
      treasure('school-5', 'Class Captain', 'crossword', 2, 'school'),
    ],
  },
  {
    id: 'food',
    title: 'Food',
    titleHe: 'אוכל',
    description: 'Delicious Hebrew vocabulary',
    color: '#f59e0b',
    icon: '🥙',
    lessons: [
      lesson('food-1', 'Bread & water', 'quiz', 1, 10, 'food'),
      lesson('food-2', 'Falafel & hummus', 'memory', 2, 15, 'food'),
      lesson('food-3', 'Fruit basket', 'quiz', 2, 15, 'food'),
      lesson('food-4', 'Dinner table', 'memory', 2, 15, 'food'),
      treasure('food-5', 'Chef Master', 'crossword', 2, 'food'),
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    titleHe: 'חיות',
    description: 'From kittens to camels',
    color: '#10b981',
    icon: '🦁',
    lessons: [
      lesson('animals-1', 'Pets', 'quiz', 1, 10, 'animals'),
      lesson('animals-2', 'Farm animals', 'memory', 2, 15, 'animals'),
      lesson('animals-3', 'Wild animals', 'quiz', 2, 15, 'animals'),
      lesson('animals-4', 'Mixed zoo', 'memory', 2, 15, 'animals'),
      treasure('animals-5', 'Zookeeper', 'crossword', 2, 'animals'),
    ],
  },
  {
    id: 'colors',
    title: 'Colors',
    titleHe: 'צבעים',
    description: 'Paint your Hebrew rainbow',
    color: '#a855f7',
    icon: '🎨',
    lessons: [
      lesson('colors-1', 'Red, blue, green', 'quiz', 1, 10, 'colors'),
      lesson('colors-2', 'Warm colors', 'memory', 2, 15, 'colors'),
      lesson('colors-3', 'Cool colors', 'quiz', 2, 15, 'colors'),
      lesson('colors-4', 'Mix it up', 'memory', 2, 15, 'colors'),
      treasure('colors-5', 'Rainbow Artist', 'crossword', 2, 'colors'),
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers',
    titleHe: 'מספרים',
    description: 'Count from one to ten',
    color: '#0d9488',
    icon: '🔢',
    lessons: [
      lesson('numbers-1', 'One to five', 'quiz', 1, 10, 'numbers'),
      lesson('numbers-2', 'Six to ten', 'memory', 2, 15, 'numbers'),
      lesson('numbers-3', 'Counting things', 'quiz', 2, 15, 'numbers'),
      lesson('numbers-4', 'Add & subtract', 'memory', 2, 15, 'numbers'),
      treasure('numbers-5', 'Math Whiz', 'crossword', 2, 'numbers'),
    ],
  },
  {
    id: 'holidays',
    title: 'Holidays',
    titleHe: 'חגים',
    description: 'Shabbat, Hanukkah, and more',
    color: '#e11d48',
    icon: '🕎',
    lessons: [
      lesson('holidays-1', 'Shabbat', 'quiz', 2, 15, 'holidays'),
      lesson('holidays-2', 'Hanukkah', 'memory', 2, 15, 'holidays'),
      lesson('holidays-3', 'Passover', 'quiz', 3, 20, 'holidays'),
      lesson('holidays-4', 'Rosh Hashanah', 'memory', 3, 20, 'holidays'),
      treasure('holidays-5', 'Holiday Hero', 'crossword', 3, 'holidays'),
    ],
  },
];

export default UNITS;

// Flat lesson list, in path order — used for progress lookups.
export const allLessons = UNITS.flatMap((unit) =>
  unit.lessons.map((l) => ({ ...l, unitId: unit.id }))
);

export const lessonsById = Object.fromEntries(allLessons.map((l) => [l.id, l]));

// Given a user's pathProgress (a map of lesson id → 'completed'), compute
// the next available lesson and the locked/available state of every lesson.
export const computePathState = (pathProgress = {}) => {
  const state = {};
  let reachedNext = false;

  for (const unit of UNITS) {
    for (const l of unit.lessons) {
      const done = pathProgress[l.id] === 'completed';
      if (done) {
        state[l.id] = 'completed';
      } else if (!reachedNext) {
        state[l.id] = 'available';
        reachedNext = true;
      } else {
        state[l.id] = 'locked';
      }
    }
  }

  return state;
};

export const computeUnitProgress = (unit, pathProgress = {}) => {
  const completed = unit.lessons.filter((l) => pathProgress[l.id] === 'completed').length;
  return { completed, total: unit.lessons.length };
};
