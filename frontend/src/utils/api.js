// API utility for making requests
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const loginUser = (username, password) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const getUserStats = (userId) => {
  return apiCall(`/users/${userId}`);
};

export const getLeaderboard = () => {
  return apiCall('/users');
};

export const updateScore = (userId, score, time, gameType, wrong = 0) => {
  return apiCall(`/users/${userId}/score`, {
    method: 'PUT',
    body: JSON.stringify({ score, time, gameType, wrong })
  });
};

export const setCharacter = (userId, character) => {
  return apiCall(`/users/${userId}/character`, {
    method: 'PUT',
    body: JSON.stringify({ character })
  });
};

export const completeLesson = (userId, payload) => {
  return apiCall(`/users/${userId}/lesson`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const getWords = () => {
  return apiCall('/games/words');
};

export const addWord = (word, translation, difficulty) => {
  return apiCall('/games/words', {
    method: 'POST',
    body: JSON.stringify({ word, translation, difficulty })
  });
};

export const deleteWord = (wordId) => {
  return apiCall(`/games/words/${wordId}`, {
    method: 'DELETE'
  });
};

export const generateQuiz = (difficulty = 2, questions = 5) => {
  return apiCall(`/games/quiz/generate?difficulty=${difficulty}&questions=${questions}`);
};

export const generateMemoryGame = (difficulty = 2, cards = 12) => {
  return apiCall(`/games/memory/generate?difficulty=${difficulty}&cards=${cards}`);
};

export const generateCrossword = (difficulty = 2) => {
  return apiCall(`/games/crossword/generate?difficulty=${difficulty}`);
};

export const getAdminSettings = () => {
  return apiCall('/admin/settings');
};

export const updateAdminSettings = (settings) => {
  return apiCall('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
};

export const getAnalytics = () => {
  return apiCall('/admin/analytics');
};

export const sendWhatsAppNotification = (userId, message) => {
  return apiCall('/admin/notify/whatsapp', {
    method: 'POST',
    body: JSON.stringify({ userId, message })
  });
};
