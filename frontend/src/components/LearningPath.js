import React from 'react';
import UNITS, { computePathState, computeUnitProgress } from '../data/learningPath';
import PathNode from './PathNode';
import '../styles/LearningPath.css';

// Vertical Duolingo-style path. Each unit is a section with a colored
// header and a zigzag of lesson nodes. We compute lock/available/completed
// state from the user's pathProgress map.

// Zigzag amplitudes (px). 5 lessons per unit → 5 positions.
const ZIGZAG = [0, 60, 90, 60, 0];

export default function LearningPath({ pathProgress = {}, onLessonClick }) {
  const state = computePathState(pathProgress);

  return (
    <div className="learning-path">
      {UNITS.map((unit) => {
        const { completed, total } = computeUnitProgress(unit, pathProgress);
        const unitDone = completed === total;
        const unitStarted = completed > 0;

        return (
          <section key={unit.id} className={`unit ${unitDone ? 'done' : unitStarted ? 'started' : ''}`} style={{ '--unit-color': unit.color }}>
            <header className="unit-header">
              <div className="unit-header-icon" aria-hidden="true">{unit.icon}</div>
              <div className="unit-header-text">
                <div className="unit-kicker">Unit · {unit.titleHe}</div>
                <h3 className="unit-title">{unit.title}</h3>
                <p className="unit-desc">{unit.description}</p>
              </div>
              <div className="unit-progress" aria-label={`${completed} of ${total} lessons completed`}>
                <div className="unit-progress-text">{completed}/{total}</div>
                <div className="unit-progress-bar">
                  <div className="unit-progress-fill" style={{ width: `${(completed / total) * 100}%` }} />
                </div>
              </div>
            </header>

            <div className="unit-nodes">
              {unit.lessons.map((lesson, i) => (
                <PathNode
                  key={lesson.id}
                  lesson={lesson}
                  state={state[lesson.id]}
                  offset={ZIGZAG[i] || 0}
                  color={unit.color}
                  onClick={onLessonClick}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
