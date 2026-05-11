import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, setCharacter } from '../utils/api';
import AvatarCharacter from '../components/AvatarCharacter';
import AvatarPicker from '../components/AvatarPicker';
import LearningPath from '../components/LearningPath';
import SoundToggle from '../components/SoundToggle';
import { useCelebration } from '../components/Celebration';
import { getCharacter } from '../data/characters';
import { allLessons } from '../data/learningPath';
import '../styles/Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(user);
  const [pickerOpen, setPickerOpen] = useState(!user.character);
  const { celebrate, banner } = useCelebration(userStats.character || 'bagelo');

  const kahootUrl = process.env.REACT_APP_KAHOOT_URL || localStorage.getItem('kahootUrl') || '';

  useEffect(() => {
    fetchUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserStats = async () => {
    try {
      const data = await getUserStats(user.id);
      setUserStats((prev) => ({ ...prev, ...data }));
      if (!data.character) setPickerOpen(true);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handlePickCharacter = async (characterId) => {
    setPickerOpen(false);
    setUserStats((prev) => ({ ...prev, character: characterId }));
    // Persist locally too so the next session has it before the API responds.
    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...cachedUser, character: characterId }));
    try {
      await setCharacter(user.id, characterId);
      celebrate(`Meet ${getCharacter(characterId).name}!`);
    } catch (e) {
      console.error('Could not save character', e);
    }
  };

  const handleLessonClick = (lesson) => {
    // Navigate to the matching game with lesson info in router state so the
    // game page can wire completion in Phase 2.
    navigate(`/${lesson.game}`, {
      state: {
        lessonId: lesson.id,
        difficulty: lesson.difficulty,
        topic: lesson.topic,
        xpReward: lesson.xpReward,
      },
    });
  };

  const handleKahoot = () => {
    let url = kahootUrl;
    if (!url) {
      url = window.prompt('Paste the Kahoot URL for this class:') || '';
      if (url) localStorage.setItem('kahootUrl', url);
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const character = getCharacter(userStats.character || 'bagelo');
  const completedCount = Object.values(userStats.pathProgress || {}).filter((s) => s === 'completed').length;
  const xpProgress = (userStats.xp || 0) % 100;
  const xpToNext = 100 - xpProgress;

  return (
    <div className="dashboard">
      {banner}

      {pickerOpen && (
        <AvatarPicker
          initialCharacterId={userStats.character}
          onPick={handlePickCharacter}
          onClose={userStats.character ? () => setPickerOpen(false) : null}
        />
      )}

      <div className="dashboard-topbar">
        <button className="topbar-character" onClick={() => setPickerOpen(true)} aria-label="Change character">
          <AvatarCharacter characterId={character.id} size="sm" />
          <div className="topbar-character-name">{character.name}</div>
        </button>

        <div className="topbar-chips">
          <div className="chip chip-xp" title="Experience points">
            <span className="chip-icon">⚡</span>
            <span className="chip-value">{userStats.xp || 0}</span>
            <span className="chip-label">XP</span>
          </div>
          <div className="chip chip-level" title="Level">
            <span className="chip-icon">🏆</span>
            <span className="chip-value">{userStats.level}</span>
            <span className="chip-label">Level</span>
          </div>
          <div className="chip chip-streak" title="Lessons completed">
            <span className="chip-icon">✅</span>
            <span className="chip-value">{completedCount}</span>
            <span className="chip-label">Done</span>
          </div>
        </div>

        <div className="topbar-actions">
          <SoundToggle />
          <button className="button button-success" onClick={handleKahoot}>Kahoot</button>
          <button className="button button-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <section className="hero">
        <div className="hero-avatar">
          <AvatarCharacter characterId={character.id} size="xl" mood="idle" />
        </div>
        <div className="hero-text">
          <div className="hero-kicker">שלום {userStats.fullName}!</div>
          <h1 className="hero-title">Ready for your next Hebrew adventure?</h1>
          <p className="hero-sub">{character.tagline}</p>

          <div className="hero-xp-ring" role="progressbar" aria-valuenow={xpProgress} aria-valuemin={0} aria-valuemax={100}>
            <div className="hero-xp-fill" style={{ width: `${xpProgress}%` }} />
          </div>
          <div className="hero-xp-label">
            {xpToNext} XP until level {userStats.level + 1}
          </div>

          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => {
              const next = allLessons.find((l) => userStats.pathProgress?.[l.id] !== 'completed');
              if (next) handleLessonClick(next);
            }}>
              Continue learning →
            </button>
            <button className="button button-text" onClick={() => navigate('/leaderboard')}>
              See leaderboard
            </button>
          </div>
        </div>
      </section>

      <section className="path-section">
        <h2 className="section-title">Your Hebrew Path</h2>
        <LearningPath
          pathProgress={userStats.pathProgress || {}}
          onLessonClick={handleLessonClick}
        />
      </section>

      <footer className="dashboard-footer">
        <button className="button button-text" onClick={() => navigate('/admin')}>Admin</button>
        <span className="footer-sep">·</span>
        <button className="button button-text" onClick={() => setPickerOpen(true)}>Change character</button>
      </footer>
    </div>
  );
}

export default Dashboard;
