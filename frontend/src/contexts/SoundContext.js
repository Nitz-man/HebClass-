import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// Central sound effects + global mute. Uses WebAudio synthesis so we don't
// ship audio assets and latency stays well under 30ms — important so the
// brain ties the sound to the action rather than perceiving it as noise.
//
// Persisted mute in localStorage. Respects browser autoplay rules: the
// AudioContext is created on first user interaction.

const SoundContext = createContext(null);

const SOUND_KEY = 'hebrewclass.sound.enabled';

// Each sound is a short blip. Pitch carries meaning across cultures:
// ascending = success, descending = failure, neutral = acknowledgment.
const RECIPES = {
  tap:     { type: 'sine',     freq: [600, 700],     dur: 0.06, gain: 0.08 },
  correct: { type: 'triangle', freq: [660, 990],     dur: 0.22, gain: 0.18 },
  wrong:   { type: 'sawtooth', freq: [330, 196],     dur: 0.32, gain: 0.12 },
  win:     { type: 'sine',     freq: [523, 659, 784, 1046], dur: 0.55, gain: 0.18 },
  streak:  { type: 'triangle', freq: [784, 1046],    dur: 0.18, gain: 0.16 },
  pop:     { type: 'sine',     freq: [880, 660],     dur: 0.1,  gain: 0.1 },
};

const playRecipe = (ctx, recipe) => {
  const { type, freq, dur, gain: peakGain } = recipe;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2500, now);

  // Walk through each frequency stop linearly.
  osc.frequency.setValueAtTime(freq[0], now);
  freq.slice(1).forEach((f, i) => {
    const t = now + (dur * (i + 1)) / freq.length;
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f), t);
  });

  // Attack/release envelope. exponentialRampTo can't hit 0, so use a tiny floor.
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + dur + 0.05);
};

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(SOUND_KEY);
    return stored === null ? true : stored === 'true';
  });
  const ctxRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(enabled));
  }, [enabled]);

  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    ctxRef.current = new AudioCtor();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (name) => {
      if (!enabled) return;
      const recipe = RECIPES[name];
      if (!recipe) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      try {
        playRecipe(ctx, recipe);
      } catch (e) {
        // Some browsers throw if the context is closed mid-tab-switch — ignore.
      }
    },
    [enabled, ensureCtx]
  );

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return (
    <SoundContext.Provider value={{ play, enabled, toggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    // Safe no-op fallback so a component used outside the provider doesn't crash.
    return { play: () => {}, enabled: false, toggle: () => {} };
  }
  return ctx;
}
