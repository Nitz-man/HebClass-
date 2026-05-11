import React from 'react';
import { useSound } from '../contexts/SoundContext';
import '../styles/GameUI.css';

export default function SoundToggle({ className = '' }) {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      className={`sound-toggle ${enabled ? 'on' : 'off'} ${className}`}
      onClick={toggle}
      aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
      title={enabled ? 'Mute sounds' : 'Unmute sounds'}
    >
      <span aria-hidden="true">{enabled ? 'ON' : 'OFF'}</span>
    </button>
  );
}
