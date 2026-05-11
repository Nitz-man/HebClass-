import React, { useState } from 'react';
import CHARACTERS from '../data/characters';
import AvatarCharacter from './AvatarCharacter';
import '../styles/AvatarPicker.css';

// Modal for picking a character. Used on first login and when the user
// wants to switch from the profile menu. Keeps focus, supports keyboard
// nav, and closes on Escape.
export default function AvatarPicker({ initialCharacterId, onPick, onClose }) {
  const [selected, setSelected] = useState(initialCharacterId || CHARACTERS[0].id);

  const handleConfirm = () => {
    onPick(selected);
  };

  return (
    <div className="avatar-picker-backdrop" role="dialog" aria-modal="true" aria-labelledby="avatar-picker-title">
      <div className="avatar-picker">
        <header className="avatar-picker-header">
          <div>
            <h2 id="avatar-picker-title">Pick your sidekick</h2>
            <p>They'll cheer you on. You can swap any time.</p>
          </div>
          {onClose && (
            <button className="avatar-picker-close" onClick={onClose} aria-label="Close">×</button>
          )}
        </header>

        <div className="avatar-picker-stage">
          <AvatarCharacter characterId={selected} size="xl" mood="idle" showName />
        </div>

        <div className="avatar-picker-grid" role="radiogroup" aria-label="Choose a character">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={selected === c.id}
              className={`avatar-card ${selected === c.id ? 'selected' : ''}`}
              onClick={() => setSelected(c.id)}
              style={{ '--char-a': c.gradient[0], '--char-b': c.gradient[1] }}
            >
              <AvatarCharacter characterId={c.id} size="md" />
              <div className="avatar-card-name">{c.name}</div>
            </button>
          ))}
        </div>

        <footer className="avatar-picker-footer">
          <button className="button button-primary button-large" onClick={handleConfirm}>
            Choose {CHARACTERS.find((c) => c.id === selected)?.name || 'this one'}
          </button>
        </footer>
      </div>
    </div>
  );
}
