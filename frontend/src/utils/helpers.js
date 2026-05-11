// Helper functions for the app

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateLevel = (score) => {
  return Math.floor(score / 100) + 1;
};

export const getColor = (difficulty) => {
  const colors = {
    1: '#dcfce7', // Green
    2: '#dbeafe', // Blue
    3: '#fef3c7', // Yellow
    4: '#fed7aa', // Orange
    5: '#fecaca'  // Red
  };
  return colors[difficulty] || '#f8fafc';
};

export const getTextColor = (wordLength) => {
  if (wordLength <= 3) return '#667eea';      // Blue
  if (wordLength <= 5) return '#ec4899';      // Pink
  if (wordLength <= 7) return '#f59e0b';      // Amber
  return '#ef4444';                           // Red
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const getStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to storage:', error);
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};
