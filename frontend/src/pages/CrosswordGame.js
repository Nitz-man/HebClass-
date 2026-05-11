import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeLesson, generateCrossword as generateCrosswordApi, updateScore } from '../utils/api';
import AvatarCharacter from '../components/AvatarCharacter';
import GameHeader from '../components/GameHeader';
import LessonComplete from '../components/LessonComplete';
import { useCelebration } from '../components/Celebration';
import { useSound } from '../contexts/SoundContext';
import { lessonsById } from '../data/learningPath';
import '../styles/CrosswordGame.css';

const MAX_HEARTS = 3;

function CrosswordGame({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lessonState = location.state || {};
  const lesson = lessonsById[lessonState.lessonId];
  const difficulty = Number(lessonState.difficulty || lesson?.difficulty || 2);
  const xpReward = Number(lessonState.xpReward || lesson?.xpReward || 10);
  const { play } = useSound();
  const { celebrate, banner } = useCelebration(user.character || 'bagelo');

  const [crossword, setCrossword] = useState({ grid: [], words: [], size: 0 });
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [completed, setCompleted] = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    generateCrossword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const normalizeCrossword = (data) => {
    if (Array.isArray(data)) {
      return {
        grid: [],
        words: data.map((item, index) => ({
          ...item,
          number: index + 1,
          direction: 'across',
          row: item.position?.row || index,
          col: item.position?.col || 0
        })),
        size: 0
      };
    }

    return data;
  };

  const generateCrossword = async () => {
    try {
      setLoading(true);
      const data = normalizeCrossword(await generateCrosswordApi(difficulty));
      setCrossword(data);

      const initialAnswers = {};
      data.words.forEach((item) => {
        initialAnswers[item.id] = '';
      });

      setAnswers(initialAnswers);
      setLoading(false);
    } catch (error) {
      console.error('Error generating crossword:', error);
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

  const handleAnswerChange = (id, value) => {
    if (!showAnswers) {
      setAnswers({ ...answers, [id]: value });
    }
  };

  const isCorrect = (item) => (
    (answers[item.id] || '').trim().toLowerCase() === item.word.toLowerCase()
  );

  const getTypedCell = (rowIndex, colIndex) => {
    for (const item of crossword.words) {
      const letters = Array.from(answers[item.id] || '');
      const wordLetters = Array.from(item.word);
      const rowStep = item.direction === 'down' ? 1 : 0;
      const colStep = item.direction === 'across' ? 1 : 0;

      for (let index = 0; index < wordLetters.length; index++) {
        const row = item.row + rowStep * index;
        const col = item.col + colStep * index;
        if (row === rowIndex && col === colIndex) {
          return showAnswers ? wordLetters[index] : letters[index] || '';
        }
      }
    }

    return '';
  };

  const getCellNumber = (rowIndex, colIndex) => {
    const word = crossword.words.find((item) => item.row === rowIndex && item.col === colIndex);
    return word?.number;
  };

  const handleSubmit = () => {
    const correctCount = crossword.words.filter(isCorrect).length;
    const wrong = crossword.words.length - correctCount;
    const finalScore = crossword.words.length ? Math.round((correctCount / crossword.words.length) * 100) : 0;
    setScore(finalScore);
    setWrongCount(wrong);
    setShowAnswers(true);
    play(wrong === 0 ? 'win' : correctCount > 0 ? 'correct' : 'wrong');
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
            gameType: lesson ? `lesson-${lesson.game}` : 'crossword',
            wrong: wrongCount
          })
        : await updateScore(user.id, score, timeTaken, 'crossword', wrongCount);
      persistUser(updatedUser);
    } catch (error) {
      console.error('Error saving crossword lesson:', error);
    }

    play('win');
    celebrate('Crossword complete!', { xp: xpReward });
    setCompleted({ score, xp: lessonState.lessonId ? xpReward : 0, wrong: wrongCount });
  };

  const handleStart = () => {
    play('tap');
    startTime.current = Date.now();
    setGameStarted(true);
  };

  if (loading) return <div className="loading">Loading crossword...</div>;

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
            <span className="game-kicker">{lesson?.title || 'Crossword practice'}</span>
            <h1>Crossword quest</h1>
            <p>Use the English clues to fill Hebrew words, then review every answer before earning XP.</p>
            <button className="button button-primary button-large" onClick={handleStart}>
              Start Crossword
            </button>
            <button className="button button-text" onClick={() => navigate('/dashboard')}>
              Back to path
            </button>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = crossword.words.filter(isCorrect).length;
  const hearts = Math.max(0, MAX_HEARTS - wrongCount);
  const progress = showAnswers ? 100 : crossword.words.length
    ? (Object.values(answers).filter((value) => value.trim()).length / crossword.words.length) * 100
    : 0;

  return (
    <div className="game-shell crossword-redesign">
      {banner}
      <GameHeader
        user={user}
        lesson={lesson}
        title="Crossword"
        progress={progress}
        hearts={hearts}
        maxHearts={MAX_HEARTS}
        streak={correctCount}
        score={score}
      />

      <div className="crossword-content game-card">
        <div className="crossword-layout">
          <div className="crossword-board-wrap">
            <AvatarCharacter
              characterId={user.character || 'bagelo'}
              size="md"
              mood={showAnswers && wrongCount === 0 ? 'celebrate' : showAnswers && wrongCount > 0 ? 'sad' : 'idle'}
            />
            <div className="crossword-board" style={{ gridTemplateColumns: `repeat(${crossword.size || 1}, 1fr)` }}>
              {crossword.grid.flatMap((row, rowIndex) => (
                row.map((cell, colIndex) => {
                  const number = getCellNumber(rowIndex, colIndex);
                  return (
                    <div key={`${rowIndex}-${colIndex}`} className={`crossword-cell ${cell ? 'open' : 'blocked'}`}>
                      {number && <span className="cell-number">{number}</span>}
                      {cell && <span className="cell-letter" dir="rtl">{getTypedCell(rowIndex, colIndex)}</span>}
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          <div className="clues-section">
            {crossword.words.map((item) => (
              <div key={item.id} className={`crossword-item ${showAnswers && isCorrect(item) ? 'correct' : showAnswers ? 'incorrect' : ''}`}>
                <div className="clue">
                  <span className="clue-number">{item.number}</span>
                  <span className="clue-text">{item.clue} ({item.direction}, {item.length})</span>
                </div>
                <input
                  type="text"
                  className="answer-input"
                  value={answers[item.id]}
                  onChange={(event) => handleAnswerChange(item.id, event.target.value)}
                  placeholder="Type Hebrew answer..."
                  disabled={showAnswers}
                  dir="rtl"
                />
                {showAnswers && (
                  <div className={`answer-feedback ${isCorrect(item) ? 'correct' : 'incorrect'}`}>
                    {isCorrect(item) ? 'Correct' : `Answer: ${item.word}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="crossword-actions">
          {!showAnswers ? (
            <button className="button button-primary button-large" onClick={handleSubmit}>
              Submit answers
            </button>
          ) : (
            <button className="button button-primary button-large" onClick={finishLesson}>
              Finish lesson
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrosswordGame;
