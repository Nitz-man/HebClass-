import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeLesson, generateMemoryGame as generateMemoryGameApi, updateScore } from '../utils/api';
import AvatarCharacter from '../components/AvatarCharacter';
import GameHeader from '../components/GameHeader';
import LessonComplete from '../components/LessonComplete';
import { useCelebration } from '../components/Celebration';
import { useSound } from '../contexts/SoundContext';
import { lessonsById } from '../data/learningPath';
import '../styles/MemoryGame.css';

const DIFFICULTIES = {
  easy: { label: 'Easy', difficulty: 1, cards: 12, hearts: 6 },
  medium: { label: 'Medium', difficulty: 2, cards: 20, hearts: 8 },
  hard: { label: 'Hard', difficulty: 3, cards: 30, hearts: 10 }
};

const difficultyKeyFromLevel = (level) => (
  Number(level) >= 3 ? 'hard' : Number(level) === 2 ? 'medium' : 'easy'
);

function MemoryGame({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lessonState = location.state || {};
  const lesson = lessonsById[lessonState.lessonId];
  const initialDifficulty = difficultyKeyFromLevel(lessonState.difficulty || lesson?.difficulty || 1);
  const xpReward = Number(lessonState.xpReward || lesson?.xpReward || 10);
  const { play, enabled } = useSound();
  const { celebrate, banner } = useCelebration(user.character || 'bagelo');

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [hearts, setHearts] = useState(DIFFICULTIES[initialDifficulty].hearts);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    generateMemoryGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  useEffect(() => {
    if (flipped.length === 2) {
      const timer = setTimeout(checkMatch, 420);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  const activeDifficulty = DIFFICULTIES[selectedDifficulty];
  const maxHearts = activeDifficulty.hearts;
  const gameComplete = cards.length > 0 && matched.length === cards.length;
  const progress = cards.length ? (matched.length / cards.length) * 100 : 0;

  const generateMemoryGame = async () => {
    try {
      setLoading(true);
      const difficulty = DIFFICULTIES[selectedDifficulty];
      const data = await generateMemoryGameApi(difficulty.difficulty, difficulty.cards);
      setCards(data);
      setFlipped([]);
      setMatched([]);
      setScore(0);
      setWrongAttempts(0);
      setHearts(difficulty.hearts);
      setStreak(0);
      setFeedback('');
      setLoading(false);
    } catch (error) {
      console.error('Error generating memory game:', error);
      setLoading(false);
    }
  };

  const persistUser = (updatedUser) => {
    if (!updatedUser?.id) return;
    localStorage.setItem('user', JSON.stringify({
      ...JSON.parse(localStorage.getItem('user') || '{}'),
      ...updatedUser
    }));
  };

  const speakWrong = () => {
    if (!enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance('Try again.');
    message.rate = 0.95;
    window.speechSynthesis.speak(message);
  };

  const checkMatch = () => {
    const [first, second] = flipped;
    const isMatch = cards[first].pairId === cards[second].pairId && cards[first].type !== cards[second].type;

    if (isMatch) {
      const nextStreak = streak + 1;
      setMatched((prevMatched) => [...prevMatched, first, second]);
      setScore((prevScore) => prevScore + 10);
      setStreak(nextStreak);
      setFeedback('+10 points');
      play(nextStreak > 0 && nextStreak % 3 === 0 ? 'streak' : 'correct');
      setFlipped([]);
    } else {
      setWrongAttempts((prevWrong) => prevWrong + 1);
      setHearts((value) => Math.max(0, value - 1));
      setStreak(0);
      setFeedback('Try again.');
      play('wrong');
      speakWrong();
      setTimeout(() => setFlipped([]), 500);
    }
  };

  const handleCardClick = (index) => {
    if (flipped.includes(index) || matched.includes(index) || hearts <= 0) return;
    if (flipped.length < 2) {
      play('tap');
      setFlipped([...flipped, index]);
    }
  };

  const handleStart = () => {
    play('tap');
    startTime.current = Date.now();
    setGameStarted(true);
  };

  const finishLesson = async () => {
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    try {
      const updatedUser = lessonState.lessonId
        ? await completeLesson(user.id, {
            lessonId: lessonState.lessonId,
            xp: xpReward,
            score,
            time: timeTaken,
            gameType: lesson ? `lesson-${lesson.game}` : `memory-${selectedDifficulty}`,
            wrong: wrongAttempts
          })
        : await updateScore(user.id, score, timeTaken, `memory-${selectedDifficulty}`, wrongAttempts);
      persistUser(updatedUser);
    } catch (error) {
      console.error('Error saving memory lesson:', error);
    }

    play('win');
    celebrate('Memory mastered!', { xp: xpReward });
    setCompleted({ score, xp: lessonState.lessonId ? xpReward : 0, wrong: wrongAttempts });
  };

  if (loading) return <div className="loading">Loading game...</div>;

  if (completed) {
    return (
      <>
        {banner}
        <LessonComplete user={user} lesson={lesson} score={completed.score} xp={completed.xp} wrong={completed.wrong} />
      </>
    );
  }

  if (!gameStarted) {
    return (
      <div className="game-shell">
        <div className="game-card game-start-card">
          <AvatarCharacter characterId={user.character || 'bagelo'} size="lg" mood="idle" showName />
          <div className="game-start-copy">
            <span className="game-kicker">{lesson?.title || 'Memory practice'}</span>
            <h1>Memory match</h1>
            <p>Match each Hebrew word with its English translation. Wrong tries cost hearts.</p>

            {!lessonState.lessonId && (
              <div className="difficulty-options" aria-label="Choose difficulty">
                {Object.entries(DIFFICULTIES).map(([key, difficulty]) => (
                  <button
                    key={key}
                    className={`difficulty-button ${selectedDifficulty === key ? 'active' : ''}`}
                    onClick={() => setSelectedDifficulty(key)}
                    type="button"
                  >
                    <span>{difficulty.label}</span>
                    <strong>{difficulty.cards} Cards</strong>
                  </button>
                ))}
              </div>
            )}

            <button className="button button-primary button-large" onClick={handleStart}>
              Start Memory
            </button>
            <button className="button button-text" onClick={() => navigate('/dashboard')}>
              Back to path
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell memory-redesign">
      {banner}
      <GameHeader
        user={user}
        lesson={lesson}
        title="Memory"
        progress={progress}
        hearts={hearts}
        maxHearts={maxHearts}
        streak={streak}
        score={score}
      />

      <div className="memory-board-card game-card">
        <div className="memory-sidekick">
          <AvatarCharacter
            characterId={user.character || 'bagelo'}
            size="md"
            mood={feedback.includes('+') ? 'celebrate' : hearts <= 0 ? 'sad' : 'idle'}
          />
          <strong>{feedback || 'Find a pair'}</strong>
          <span>{matched.length / 2}/{cards.length / 2} pairs</span>
        </div>

        <div className={`memory-grid ${selectedDifficulty}`}>
          {cards.map((card, index) => (
            <button
              key={`${card.id}-${index}`}
              type="button"
              className={`memory-card ${flipped.includes(index) || matched.includes(index) ? 'flipped' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <span className="card-inner">
                <span className="card-front">?</span>
                <span className={`card-back ${card.type}`}>{card.content}</span>
              </span>
            </button>
          ))}
        </div>

        {(gameComplete || hearts <= 0) && (
          <div className="memory-finish-panel">
            <h2>{gameComplete ? 'All pairs matched' : 'No hearts left'}</h2>
            <p>{gameComplete ? 'Lock in your XP and continue the path.' : 'Finish this attempt and review the missed pairs.'}</p>
            <button className="button button-primary button-large" onClick={finishLesson}>
              Finish lesson
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemoryGame;
