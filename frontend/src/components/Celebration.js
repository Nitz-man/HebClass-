import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import AvatarCharacter from './AvatarCharacter';
import useReducedMotion from '../hooks/useReducedMotion';
import '../styles/Celebration.css';

// useCelebration returns { celebrate, banner }.
//   celebrate(message, opts) fires confetti and optionally raises a banner.
//   banner is a React node to render inside the layout — usually mounted
//   once at the page root.
//
// This is the central "you did the thing" moment: confetti + a 1.8s banner
// with the user's character cheering. We do NOT play sound from here —
// that belongs in the (future) sound system so it can be muted globally.

const DEFAULT_DURATION = 1800;

export function useCelebration(characterId) {
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();
  const timer = useRef(null);

  const fireConfetti = useCallback(() => {
    if (reduced) return;
    const end = Date.now() + 800;
    const colors = ['#6366f1', '#ec4899', '#fbbf24', '#10b981', '#f97316'];
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.85 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.85 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [reduced]);

  const celebrate = useCallback(
    (message = 'Great job!', opts = {}) => {
      const duration = opts.duration ?? DEFAULT_DURATION;
      fireConfetti();
      setActive({ message, xp: opts.xp });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(null), duration);
    },
    [fireConfetti]
  );

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const banner = active ? (
    <CelebrationBanner
      characterId={characterId}
      message={active.message}
      xp={active.xp}
    />
  ) : null;

  return { celebrate, banner };
}

function CelebrationBanner({ characterId, message, xp }) {
  return (
    <div className="celebration-banner" role="status" aria-live="polite">
      <div className="celebration-card">
        <AvatarCharacter characterId={characterId} size="lg" mood="celebrate" />
        <div className="celebration-text">
          <div className="celebration-message">{message}</div>
          {xp ? <div className="celebration-xp">+{xp} XP</div> : null}
        </div>
      </div>
    </div>
  );
}

export default CelebrationBanner;
