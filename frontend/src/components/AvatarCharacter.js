import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { getCharacter } from '../data/characters';
import useReducedMotion from '../hooks/useReducedMotion';
import '../styles/AvatarCharacter.css';

// Renders a character avatar. If the character has a `lottieUrl`, fetch
// and play it. Otherwise (and as a fail-safe), render a CSS-animated emoji
// badge — ships visually complete with no external assets, ready to swap.
//
// Sizes: 'sm' (40px), 'md' (80px), 'lg' (140px), 'xl' (220px).
// Mood: 'idle' (default), 'celebrate' (bigger, faster), 'sad' (gentle sway).

export default function AvatarCharacter({
  characterId,
  size = 'md',
  mood = 'idle',
  showName = false,
  className = '',
}) {
  const character = getCharacter(characterId);
  const reduced = useReducedMotion();
  const [lottieData, setLottieData] = useState(null);
  const [lottieFailed, setLottieFailed] = useState(false);
  const fetchedFor = useRef(null);

  useEffect(() => {
    if (!character.lottieUrl) {
      setLottieData(null);
      setLottieFailed(false);
      return;
    }
    if (fetchedFor.current === character.lottieUrl) return;
    fetchedFor.current = character.lottieUrl;

    fetch(character.lottieUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((data) => setLottieData(data))
      .catch(() => setLottieFailed(true));
  }, [character.lottieUrl]);

  const useLottie = lottieData && !lottieFailed && !reduced;

  const [a, b] = character.gradient;
  const moodClass = `mood-${mood}`;
  const animClass = reduced ? 'anim-reduced' : `anim-${character.animation}`;

  return (
    <div className={`avatar-character size-${size} ${moodClass} ${className}`}>
      <div
        className="avatar-disc"
        style={{ background: `radial-gradient(circle at 30% 30%, ${a}, ${b})` }}
      >
        {useLottie ? (
          <Lottie
            animationData={lottieData}
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className={`avatar-emoji ${animClass}`} aria-hidden="true">
            <span className="emoji-main">{character.emoji}</span>
            <span className="emoji-accent">{character.accent}</span>
          </div>
        )}
      </div>
      {showName && (
        <div className="avatar-name">
          <div className="avatar-name-text">{character.name}</div>
          <div className="avatar-name-tagline">{character.tagline}</div>
        </div>
      )}
    </div>
  );
}
