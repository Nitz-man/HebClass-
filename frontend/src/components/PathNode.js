import React from 'react';

// A single lesson node on the Duolingo-style learning path.
// state: 'locked' | 'available' | 'completed'
// type: 'lesson' | 'treasure'

const stateIcon = {
  locked: '🔒',
  available: '⭐',
  completed: '✓',
};

const treasureIcon = {
  locked: '🔒',
  available: '🎁',
  completed: '👑',
};

export default function PathNode({
  lesson,
  state,
  offset,         // horizontal offset px for zigzag
  color,          // unit color
  onClick,
}) {
  const isTreasure = lesson.type === 'treasure';
  const icon = isTreasure ? treasureIcon[state] : stateIcon[state];
  const disabled = state === 'locked';

  const className = [
    'path-node',
    `state-${state}`,
    isTreasure ? 'treasure' : 'lesson',
    state === 'available' ? 'pulsing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="path-node-row" style={{ transform: `translateX(${offset}px)` }}>
      <button
        className={className}
        onClick={disabled ? undefined : () => onClick(lesson)}
        disabled={disabled}
        aria-label={`${lesson.title}${disabled ? ' (locked)' : ''}`}
        style={{
          '--node-color': color,
        }}
      >
        <span className="path-node-icon" aria-hidden="true">{icon}</span>
        {state === 'available' && <span className="path-node-pulse" aria-hidden="true" />}
      </button>
      <div className="path-node-label">{lesson.title}</div>
    </div>
  );
}
