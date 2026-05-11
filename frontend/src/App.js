import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import QuizGame from './pages/QuizGame';
import CrosswordGame from './pages/CrosswordGame';
import MemoryGame from './pages/MemoryGame';
import AdminPortal from './pages/AdminPortal';
import AdminTheme from './pages/AdminTheme';
import AdminWordBank from './pages/AdminWordBank';
import AdminAnalytics from './pages/AdminAnalytics';
import GeneratedMusicPlayer from './components/GeneratedMusicPlayer';
import { SoundProvider } from './contexts/SoundContext';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
const DEFAULT_APP_THEME = {
  primaryColor: '#6366f1',
  secondaryColor: '#ec4899',
  backgroundColor: '#f8fafc',
  textColor: '#1e293b'
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appSettings, setAppSettings] = useState(DEFAULT_APP_THEME);
  const [musicEnabled, setMusicEnabled] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser?.id) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Fetch app settings
    fetchAppSettings();
    setLoading(false);
  }, []);

  const fetchAppSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/settings`);
      const data = await response.json();
      setAppSettings({ ...DEFAULT_APP_THEME, ...(data.appTheme || {}) });
      setMusicEnabled(data.sounds?.enabled !== false);
    } catch (error) {
      console.log('Using default settings');
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <SoundProvider>
    <Router>
      <div className="App" style={{ '--primary-color': appSettings.primaryColor || DEFAULT_APP_THEME.primaryColor, '--secondary-color': appSettings.secondaryColor || DEFAULT_APP_THEME.secondaryColor }}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/leaderboard" 
            element={user ? <Leaderboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/quiz" 
            element={user ? <QuizGame user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/crossword" 
            element={user ? <CrosswordGame user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/memory" 
            element={user ? <MemoryGame user={user} /> : <Navigate to="/login" />} 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={user ? <AdminPortal /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/theme" 
            element={user ? <AdminTheme /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/words" 
            element={user ? <AdminWordBank /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/analytics" 
            element={user ? <AdminAnalytics /> : <Navigate to="/login" />} 
          />

          {/* Default */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
        <GeneratedMusicPlayer enabled={musicEnabled} />
      </div>
    </Router>
    </SoundProvider>
  );
}

export default App;
