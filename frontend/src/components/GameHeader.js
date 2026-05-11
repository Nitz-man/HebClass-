import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarCharacter from './AvatarCharacter';
import Hearts from './Hearts';
import SoundToggle from './SoundToggle';
import '../styles/GameUI.css';

export default function GameHeader({
  user,
  lesson,
  title,
  progress,
  hearts,
  maxHearts = 3,
  streak = 0,
  score = 0
}) {
  const navigate = useNavigate();
  const characterId = user?.character || 'bagelo';

  return (
    <header className="game-topbar">
      <button className="game-back" type="button" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
        Back
      </button>

      <div className="game-topbar-main">
        <AvatarCharacter characterId={characterId} size="sm" mood={streak >= 3 ? 'celebrate' : 'idle'} />
        <div>
          <div className="game-kicker">{lesson?.title || 'Practice'}</div>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="game-status-cluster">
        <div className="game-pill">Score {score}</div>
        <div className="game-pill">Streak {streak}</div>
        {typeof hearts === 'number' && <Hearts value={hearts} max={maxHearts} />}
        <SoundToggle />
      </div>

      {typeof progress === 'number' && (
        <div className="game-progress" aria-hidden="true">
          <div className="game-progress-fill" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </header>
  );
}
