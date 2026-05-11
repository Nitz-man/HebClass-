// Game data structure
// Contains word bank and game templates

const gameData = {
  wordBank: [
    // Hebrew words format: { word: "Hebrew", translation: "English", difficulty: 1-5 }
    { id: 1, word: "ספר", translation: "Book", difficulty: 1, length: 3 },
    { id: 2, word: "מנורה", translation: "Chandelier", difficulty: 2, length: 4 },
    { id: 3, word: "תפוח", translation: "Apple", difficulty: 1, length: 4 },
    { id: 4, word: "ביבליוטקה", translation: "Library", difficulty: 3, length: 8 },
    { id: 5, word: "מחשב", translation: "Computer", difficulty: 2, length: 5 },
    { id: 6, word: "משפחה", translation: "Family", difficulty: 1, length: 5 },
    { id: 7, word: "מורה", translation: "Teacher", difficulty: 1, length: 4 },
    { id: 8, word: "תלמיד", translation: "Student", difficulty: 1, length: 5 },
    { id: 9, word: "חברים", translation: "Friends", difficulty: 1, length: 5 },
    { id: 10, word: "ספורט", translation: "Sport", difficulty: 1, length: 4 }
  ],
  quizzes: [],
  crosswords: [],
  memoryCards: []
};

module.exports = gameData;
