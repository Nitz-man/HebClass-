const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import file-backed database helpers
const { readDatabase, updateDatabase } = require('./data/database');

const fallbackHebrewWords = [
  { id: 1001, word: 'שלום', translation: 'Hello', difficulty: 1, length: 4 },
  { id: 1002, word: 'מים', translation: 'Water', difficulty: 1, length: 3 },
  { id: 1003, word: 'בית', translation: 'House', difficulty: 1, length: 3 },
  { id: 1004, word: 'כלב', translation: 'Dog', difficulty: 1, length: 3 },
  { id: 1005, word: 'חתול', translation: 'Cat', difficulty: 1, length: 4 },
  { id: 1006, word: 'שמש', translation: 'Sun', difficulty: 1, length: 3 },
  { id: 1007, word: 'ירח', translation: 'Moon', difficulty: 1, length: 3 },
  { id: 1008, word: 'אוכל', translation: 'Food', difficulty: 2, length: 4 },
  { id: 1009, word: 'כיתה', translation: 'Classroom', difficulty: 2, length: 4 },
  { id: 1010, word: 'מחברת', translation: 'Notebook', difficulty: 2, length: 5 },
  { id: 1011, word: 'עיפרון', translation: 'Pencil', difficulty: 2, length: 6 },
  { id: 1012, word: 'חלון', translation: 'Window', difficulty: 2, length: 4 },
  { id: 1013, word: 'חברות', translation: 'Friendship', difficulty: 3, length: 5 },
  { id: 1014, word: 'מחשבה', translation: 'Thought', difficulty: 3, length: 5 },
  { id: 1015, word: 'הרפתקה', translation: 'Adventure', difficulty: 3, length: 6 }
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const getWordPool = (gameData, difficulty, minimum = 0) => {
  const maxDifficulty = Number(difficulty);
  const wordsByTranslation = new Map();

  [...gameData.wordBank, ...fallbackHebrewWords]
    .filter(word => Number(word.difficulty) <= maxDifficulty)
    .forEach((word) => {
      const key = String(word.translation).toLowerCase();
      if (!wordsByTranslation.has(key)) {
        wordsByTranslation.set(key, word);
      }
    });

  const pool = [...wordsByTranslation.values()];
  if (minimum && pool.length < minimum) {
    return [...pool, ...fallbackHebrewWords.filter(word => !pool.includes(word))].slice(0, minimum);
  }

  return pool;
};

const getQuizOptions = (correctTranslation, wordPool) => {
  const distractors = shuffle(wordPool
    .map(word => word.translation)
    .filter(translation => translation !== correctTranslation));

  return shuffle([correctTranslation, ...distractors.slice(0, 3)]);
};

const placeCrosswordWords = (words) => {
  const size = 13;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = [];

  const canPlace = (letters, row, col, direction) => {
    const rowStep = direction === 'down' ? 1 : 0;
    const colStep = direction === 'across' ? 1 : 0;
    const endRow = row + rowStep * (letters.length - 1);
    const endCol = col + colStep * (letters.length - 1);

    if (row < 0 || col < 0 || endRow >= size || endCol >= size) return false;

    return letters.every((letter, index) => {
      const cell = grid[row + rowStep * index][col + colStep * index];
      return cell === null || cell === letter;
    });
  };

  const writeWord = (wordItem, row, col, direction) => {
    const letters = Array.from(wordItem.word);
    const rowStep = direction === 'down' ? 1 : 0;
    const colStep = direction === 'across' ? 1 : 0;

    letters.forEach((letter, index) => {
      grid[row + rowStep * index][col + colStep * index] = letter;
    });

    placed.push({
      id: placed.length,
      word: wordItem.word,
      clue: wordItem.translation,
      direction,
      row,
      col,
      length: letters.length,
      number: placed.length + 1
    });
  };

  words.forEach((wordItem, wordIndex) => {
    const letters = Array.from(wordItem.word);

    if (wordIndex === 0) {
      writeWord(wordItem, Math.floor(size / 2), Math.max(0, Math.floor((size - letters.length) / 2)), 'across');
      return;
    }

    let placedWord = false;

    for (const existing of placed) {
      const existingLetters = Array.from(existing.word);
      for (let i = 0; i < letters.length && !placedWord; i++) {
        const matchIndex = existingLetters.indexOf(letters[i]);
        if (matchIndex === -1) continue;

        const direction = existing.direction === 'across' ? 'down' : 'across';
        const row = existing.row + (existing.direction === 'down' ? matchIndex : 0) - (direction === 'down' ? i : 0);
        const col = existing.col + (existing.direction === 'across' ? matchIndex : 0) - (direction === 'across' ? i : 0);

        if (canPlace(letters, row, col, direction)) {
          writeWord(wordItem, row, col, direction);
          placedWord = true;
        }
      }
    }

    if (!placedWord) {
      const row = (wordIndex * 2) % size;
      const direction = wordIndex % 2 === 0 ? 'across' : 'down';
      const col = Math.max(0, Math.min(size - letters.length, wordIndex));
      if (canPlace(letters, row, col, direction)) {
        writeWord(wordItem, row, col, direction);
      }
    }
  });

  return { grid, words: placed, size };
};

// ==================== AUTHENTICATION ROUTES ====================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    const { users } = readDatabase();

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For demo purposes, accept password as is
    // In production, use bcrypt to compare hashed passwords
    if (user.password !== password && !password.startsWith('$2a$')) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        character: user.character || null,
        xp: user.xp || 0,
        pathProgress: user.pathProgress || {},
        level: user.level,
        score: user.score
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get('/api/users/:id', (req, res) => {
  try {
    const { users } = readDatabase();
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (leaderboard)
app.get('/api/users', (req, res) => {
  try {
    const { users } = readDatabase();
    const leaderboard = users
      .map(u => ({
        id: u.id,
        fullName: u.fullName,
        level: u.level,
        score: u.score,
        totalTime: u.totalTime,
        avatar: u.avatar
      }))
      .sort((a, b) => b.score - a.score);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user score
app.put('/api/users/:id/score', (req, res) => {
  try {
    const { score = 0, time = 0, gameType = 'unknown', wrong = 0 } = req.body;
    const updatedUser = updateDatabase((database) => {
      const user = database.users.find(u => u.id === parseInt(req.params.id));

      if (!user) {
        return null;
      }

      user.score += Number(score);
      user.totalTime += Number(time);
      user.gamesPlayed.push({
        gameType,
        score: Number(score),
        time: Number(time),
        wrong: Number(wrong),
        date: new Date().toISOString()
      });

      // Update level based on score
      user.level = Math.floor(user.score / 100) + 1;
      user.lastActive = new Date().toISOString();

      return user;
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set the user's chosen character (the animated brainrot-style avatar).
// Idempotent — picking the same character again is a no-op.
app.put('/api/users/:id/character', (req, res) => {
  try {
    const { character } = req.body;
    if (typeof character !== 'string' || !character) {
      return res.status(400).json({ message: 'character is required' });
    }

    const updatedUser = updateDatabase((database) => {
      const user = database.users.find(u => u.id === parseInt(req.params.id));
      if (!user) return null;
      user.character = character;
      return user;
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: updatedUser.id,
      character: updatedUser.character,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a lesson on the learning path complete and award XP. Bumps the
// game stats too so the leaderboard stays in sync.
app.put('/api/users/:id/lesson', (req, res) => {
  try {
    const { lessonId, xp = 10, score = 0, time = 0, gameType = 'lesson', wrong = 0 } = req.body;
    if (!lessonId) {
      return res.status(400).json({ message: 'lessonId is required' });
    }

    const updatedUser = updateDatabase((database) => {
      const user = database.users.find(u => u.id === parseInt(req.params.id));
      if (!user) return null;

      user.pathProgress = user.pathProgress || {};
      const alreadyDone = user.pathProgress[lessonId] === 'completed';
      user.pathProgress[lessonId] = 'completed';

      // Only award XP/score the first time a lesson is completed.
      if (!alreadyDone) {
        user.xp = (user.xp || 0) + Number(xp);
        user.score = (user.score || 0) + Number(score);
      }
      user.totalTime = (user.totalTime || 0) + Number(time);
      user.gamesPlayed = user.gamesPlayed || [];
      user.gamesPlayed.push({
        gameType,
        lessonId,
        score: Number(score),
        time: Number(time),
        wrong: Number(wrong),
        date: new Date().toISOString(),
      });
      user.level = Math.floor((user.score || 0) / 100) + 1;
      user.lastActive = new Date().toISOString();

      return user;
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== GAME ROUTES ====================

// Get all words (word bank)
app.get('/api/games/words', (req, res) => {
  try {
    const { gameData } = readDatabase();
    res.json(gameData.wordBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add word to word bank (Admin only)
app.post('/api/games/words', (req, res) => {
  try {
    const { word, translation, difficulty } = req.body;

    const newWord = updateDatabase((database) => {
      const nextId = Math.max(0, ...database.gameData.wordBank.map(item => item.id)) + 1;

      const createdWord = {
        id: nextId,
        word,
        translation,
        difficulty: Number(difficulty),
        length: word.length
      };

      database.gameData.wordBank.push(createdWord);
      return createdWord;
    });

    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove word from word bank (Admin only)
app.delete('/api/games/words/:id', (req, res) => {
  try {
    const wordId = parseInt(req.params.id);

    const deletedWord = updateDatabase((database) => {
      const wordIndex = database.gameData.wordBank.findIndex(word => word.id === wordId);

      if (wordIndex === -1) {
        return null;
      }

      const [removedWord] = database.gameData.wordBank.splice(wordIndex, 1);
      return removedWord;
    });

    if (!deletedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }

    res.json({ message: 'Word removed', word: deletedWord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate quiz from word bank
app.get('/api/games/quiz/generate', (req, res) => {
  try {
    const { gameData } = readDatabase();
    const { difficulty = 2, questions = 5 } = req.query;
    const wordPool = getWordPool(gameData, difficulty, Number(questions) + 4);
    const selectedWords = shuffle(wordPool).slice(0, Number(questions));

    const quiz = selectedWords.map((word, index) => ({
      id: index + 1,
      word: word.word,
      translation: word.translation,
      options: getQuizOptions(word.translation, wordPool),
      difficulty: word.difficulty
    }));

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate memory game cards
app.get('/api/games/memory/generate', (req, res) => {
  try {
    const { gameData } = readDatabase();
    const { difficulty = 2, cards = 12 } = req.query;
    const requestedCards = Math.max(12, Math.min(30, Number(cards)));
    const pairCount = Math.floor(requestedCards / 2);
    const filteredWords = shuffle(getWordPool(gameData, difficulty, pairCount)).slice(0, pairCount);

    const pairs = [];
    for (let i = 0; i < filteredWords.length; i++) {
      const word = filteredWords[i];
      pairs.push(
        { id: i * 2, pairId: word.id, type: 'word', content: word.word },
        { id: i * 2 + 1, pairId: word.id, type: 'translation', content: word.translation }
      );
    }

    res.json(shuffle(pairs));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate crossword
app.get('/api/games/crossword/generate', (req, res) => {
  try {
    const { gameData } = readDatabase();
    const { difficulty = 2 } = req.query;

    const filteredWords = shuffle(getWordPool(gameData, difficulty, 8))
      .filter(word => Array.from(word.word).length <= 8)
      .slice(0, 8);

    res.json(placeCrosswordWords(filteredWords));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Get admin settings
app.get('/api/admin/settings', (req, res) => {
  try {
    const { adminSettings } = readDatabase();
    res.json(adminSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin settings
app.put('/api/admin/settings', (req, res) => {
  try {
    const { appTheme, layout, sounds, notifications, gameSettings } = req.body;

    const updatedSettings = updateDatabase((database) => {
      if (appTheme) Object.assign(database.adminSettings.appTheme, appTheme);
      if (layout) Object.assign(database.adminSettings.layout, layout);
      if (sounds) Object.assign(database.adminSettings.sounds, sounds);
      if (notifications) Object.assign(database.adminSettings.notifications, notifications);
      if (gameSettings) Object.assign(database.adminSettings.gameSettings, gameSettings);

      return database.adminSettings;
    });

    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user analytics
app.get('/api/admin/analytics', (req, res) => {
  try {
    const { users } = readDatabase();
    const analytics = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      level: user.level,
      score: user.score,
      totalTime: user.totalTime,
      gamesPlayed: user.gamesPlayed.length,
      wrongAnswers: user.gamesPlayed.reduce((acc, game) => acc + (game.wrong || 0), 0),
      lastActive: user.gamesPlayed.length > 0 ? user.gamesPlayed[user.gamesPlayed.length - 1].date : null
    }));

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send WhatsApp notification (integration point)
app.post('/api/admin/notify/whatsapp', (req, res) => {
  try {
    const { userId, message } = req.body;
    // Integration with WhatsApp Web API or Twilio
    console.log(`WhatsApp notification for user ${userId}: ${message}`);
    res.json({ status: 'sent', message: 'Notification queued' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== INITIAL USERNAMES & PASSWORDS ====================
/**
 * Default users created:
 * itay / password123
 * tal / password123
 * leo / password123
 * ariel / password123
 * dean / password123
 * ellie / password123
 * 
 * Admin panel credentials (to be added):
 * admin / admin123
 */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: process.env.PORT || 5000 });
});

// Serve the React production build from the backend when deployed as one app.
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
