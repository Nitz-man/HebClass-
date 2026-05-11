import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeLesson, generateQuiz as generateQuizApi, updateScore } from '../utils/api';
import AvatarCharacter from '../components/AvatarCharacter';
import GameHeader from '../components/GameHeader';
import LessonComplete from '../components/LessonComplete';
import { useCelebration } from '../components/Celebration';
import { useSound } from '../contexts/SoundContext';
import { lessonsById } from '../data/learningPath';
import '../styles/QuizGame.css';

const MAX_HEARTS = 3;

function QuizGame({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lessonState = location.state || {};
  const lesson = lessonsById[lessonState.lessonId];
  const difficulty = Number(lessonState.difficulty || lesson?.difficulty || 2);
  const xpReward = Number(lessonState.xpReward || lesson?.xpReward || 10);
  const { play } = useSound();
  const { celebrate, banner } = useCelebration(user.character || 'bagelo');

  const [quiz, setQuiz] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [completed, setCompleted] = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    generateQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const currentQ = quiz[currentQuestion];
  const progress = quiz.length ? ((currentQuestion + (selectedAnswer ? 1 : 0)) / quiz.length) * 100 : 0;
  const score = correctAnswers * 10;

  const answerOptions = useMemo(() => {
    if (!currentQ) return [];
    return currentQ.options || [currentQ.translation];
  }, [currentQ]);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      const data = await generateQuizApi(difficulty, 5);
      setQuiz(data);
      setLoading(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
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

  const finishLesson = async () => {
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const finalScore = correctAnswers * 10;
    const payload = {
      lessonId: lessonState.lessonId,
      xp: xpReward,
      score: finalScore,
      time: timeTaken,
      gameType: lesson ? `lesson-${lesson.game}` : 'quiz',
      wrong: wrongAnswers
    };

    try {
      const updatedUser = lessonState.lessonId
        ? await completeLesson(user.id, payload)
        : await updateScore(user.id, finalScore, timeTaken, 'quiz', wrongAnswers);
      persistUser(updatedUser);
    } catch (error) {
      console.error('Error saving lesson:', error);
    }

    play('win');
    celebrate('Lesson complete!', { xp: xpReward });
    setCompleted({ score: finalScore, xp: lessonState.lessonId ? xpReward : 0, wrong: wrongAnswers });
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer) return;

    play('tap');
    setSelectedAnswer(answer);

    const correct = answer === currentQ.translation;
    if (correct) {
      const nextStreak = streak + 1;
      setCorrectAnswers((value) => value + 1);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      play(nextStreak > 0 && nextStreak % 3 === 0 ? 'streak' : 'correct');
    } else {
      setWrongAnswers((value) => value + 1);
      setStreak(0);
      setHearts((value) => Math.max(0, value - 1));
      play('wrong');
    }
  };

  const handleNext = async () => {
    const outOfHearts = hearts <= 0;
    if (currentQuestion < quiz.length - 1 && !outOfHearts) {
      setCurrentQuestion((value) => value + 1);
      setSelectedAnswer(null);
      return;
    }

    await finishLesson();
  };

  const handleStart = () => {
    play('tap');
    startTime.current = Date.now();
    setGameStarted(true);
  };

  if (loading) return <div className="loading">Loading quiz...</div>;

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
            <span className="game-kicker">{lesson?.title || 'Quiz practice'}</span>
            <h1>Translation challenge</h1>
            <p>Pick the English translation, keep your hearts, and build a streak.</p>
            <button className="button button-primary button-large" onClick={handleStart}>
              Start Quiz
            </button>
            <button className="button button-text" onClick={() => navigate('/dashboard')}>
              Back to path
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return <div className="loading">No quiz questions available.</div>;

  return (
    <div className="game-shell quiz-redesign">
      {banner}
      <GameHeader
        user={user}
        lesson={lesson}
        title="Quiz"
        progress={progress}
        hearts={hearts}
        maxHearts={MAX_HEARTS}
        streak={bestStreak}
        score={score}
      />

      <main className="quiz-stage game-card" key={currentQ.id}>
        <div className="quiz-avatar-rail">
          <AvatarCharacter
            characterId={user.character || 'bagelo'}
            size="lg"
            mood={selectedAnswer === currentQ.translation ? 'celebrate' : selectedAnswer ? 'sad' : 'idle'}
          />
          <div className="quiz-streak-card">
            <span>Current streak</span>
            <strong>{streak}</strong>
          </div>
        </div>

        <section className="question-section">
          <div className="question-text">
            <p>What is the English translation of:</p>
            <h2 className="word">{currentQ.word}</h2>
          </div>

          <div className="answers-grid">
            {answerOptions.map((answer) => {
              const showResult = selectedAnswer !== null;
              const isCorrect = answer === currentQ.translation;
              const isSelected = selectedAnswer === answer;
              return (
                <button
                  key={answer}
                  className={`answer-button ${showResult && isCorrect ? 'correct' : ''} ${isSelected && !isCorrect ? 'wrong' : ''}`}
                  onClick={() => handleAnswerClick(answer)}
                  disabled={showResult}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <button className="button button-primary button-large" onClick={handleNext}>
              {currentQuestion === quiz.length - 1 || hearts <= 0 ? 'Finish lesson' : 'Next question'}
            </button>
          )}
        </section>
      </main>
    </div>
  );
}

export default QuizGame;
