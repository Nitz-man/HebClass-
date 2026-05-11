import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarCharacter from './AvatarCharacter';
import '../styles/GameUI.css';

export default function LessonComplete({ user, lesson, score, xp, wrong = 0 }) {
  const navigate = useNavigate();
  const characterId = user?.character || 'bagelo';

  return (
    <div className="lesson-complete">
      <div className="lesson-complete-card">
        <AvatarCharacter characterId={characterId} size="xl" mood="celebrate" showName />
        <div className="lesson-complete-copy">
          <span className="game-kicker">{lesson?.title || 'Practice complete'}</span>
          <h1>Lesson complete</h1>
          <p>Your character is cheering you back to the path.</p>
        </div>

        <div className="complete-stats">
          <div>
            <span>XP</span>
            <strong>+{xp}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>Review</span>
            <strong>{wrong}</strong>
          </div>
        </div>

        <button className="button button-primary button-large" type="button" onClick={() => navigate('/dashboard')}>
          Continue path
        </button>
      </div>
    </div>
  );
}
