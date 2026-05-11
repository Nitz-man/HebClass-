import React, { useEffect, useRef, useState } from 'react';
import '../styles/GeneratedMusicPlayer.css';

const TEMPO = 112;
const STEP_SECONDS = 60 / TEMPO / 2;

const leadPattern = [
  659, 740, 880, null, 988, 880, 740, 659,
  587, 659, 740, 880, 740, 659, 587, null,
  659, 740, 880, 988, 1175, 988, 880, 740,
  659, null, 587, 659, 740, 659, 587, 523
];

const bassPattern = [
  165, null, 165, 196, 220, null, 220, 196,
  147, null, 147, 175, 196, null, 196, 220
];

const chordPattern = [
  [330, 415, 494],
  null,
  [370, 440, 554],
  null,
  [294, 370, 440],
  null,
  [330, 392, 494],
  null
];

function GeneratedMusicPlayer({ enabled = true }) {
  const [playing, setPlaying] = useState(false);
  const [style, setStyle] = useState('groove');
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const masterGainRef = useRef(null);

  useEffect(() => {
    if (!enabled && playing) {
      stopMusic();
    }

    return () => stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.55;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    return audioContextRef.current;
  };

  const connectVoice = (source, gainValue, now, duration, filterType = 'lowpass', filterFrequency = 1800) => {
    const context = getAudioContext();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFrequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current);
  };

  const playTone = ({ frequency, type = 'sine', gain = 0.08, duration = 0.22, when = 0, filter = 1800 }) => {
    if (!frequency) return;
    const context = getAudioContext();
    const now = context.currentTime + when;
    const oscillator = context.createOscillator();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.detune.setValueAtTime((Math.random() - 0.5) * 6, now);

    connectVoice(oscillator, gain, now, duration, 'lowpass', filter);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  };

  const playNoise = ({ gain = 0.05, duration = 0.05, when = 0, filter = 2200 }) => {
    const context = getAudioContext();
    const now = context.currentTime + when;
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    connectVoice(source, gain, now, duration, 'highpass', filter);
    source.start(now);
    source.stop(now + duration + 0.02);
  };

  const playKick = (when = 0) => {
    const context = getAudioContext();
    const now = context.currentTime + when;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(110, now);
    oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.12);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    oscillator.connect(gain);
    gain.connect(masterGainRef.current);
    oscillator.start(now);
    oscillator.stop(now + 0.18);
  };

  const playChord = (frequencies, step) => {
    if (!frequencies) return;
    frequencies.forEach((frequency, index) => {
      playTone({
        frequency,
        type: style === 'sparkle' ? 'triangle' : 'sine',
        gain: 0.035,
        duration: STEP_SECONDS * 3.4,
        when: index * 0.01,
        filter: step % 16 === 0 ? 2200 : 1400
      });
    });
  };

  const playStep = () => {
    const step = stepRef.current;
    const lead = leadPattern[step % leadPattern.length];
    const bass = bassPattern[step % bassPattern.length];
    const chord = chordPattern[Math.floor(step / 4) % chordPattern.length];

    if (step % 4 === 0 || step % 16 === 10) playKick();
    if (step % 8 === 4) playNoise({ gain: 0.08, duration: 0.08, filter: 1200 });
    if (step % 2 === 1) playNoise({ gain: style === 'sparkle' ? 0.035 : 0.025, duration: 0.03, filter: 4800 });

    playTone({
      frequency: bass,
      type: 'triangle',
      gain: 0.09,
      duration: STEP_SECONDS * 1.7,
      filter: 700
    });

    if (step % 4 === 0) playChord(chord, step);

    playTone({
      frequency: lead,
      type: style === 'sparkle' ? 'triangle' : 'square',
      gain: style === 'sparkle' ? 0.05 : 0.04,
      duration: STEP_SECONDS * 0.85,
      filter: style === 'sparkle' ? 3200 : 1800
    });

    if (style === 'sparkle' && lead && step % 8 === 2) {
      playTone({
        frequency: lead * 2,
        type: 'sine',
        gain: 0.025,
        duration: STEP_SECONDS * 0.55,
        when: STEP_SECONDS * 0.55,
        filter: 4200
      });
    }

    stepRef.current += 1;
  };

  const startMusic = async () => {
    if (!enabled || playing) return;

    const context = getAudioContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    stepRef.current = 0;
    playStep();
    timerRef.current = window.setInterval(playStep, STEP_SECONDS * 1000);
    setPlaying(true);
  };

  const stopMusic = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setPlaying(false);
  };

  const handleToggle = () => {
    if (playing) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  const handleStyle = (event) => {
    setStyle(event.target.value);
  };

  if (!enabled) return null;

  return (
    <div className={`music-widget ${playing ? 'is-playing' : ''}`}>
      <button
        type="button"
        className="music-toggle"
        onClick={handleToggle}
        title={playing ? 'Stop upbeat music' : 'Play upbeat music'}
        aria-label={playing ? 'Stop upbeat music' : 'Play upbeat music'}
      >
        <span className="music-dot" aria-hidden="true" />
        {playing ? 'Music On' : 'Play Music'}
      </button>

      <select
        className="music-style"
        value={style}
        onChange={handleStyle}
        aria-label="Music style"
        title="Music style"
      >
        <option value="groove">Groove</option>
        <option value="sparkle">Sparkle</option>
      </select>
    </div>
  );
}

export default GeneratedMusicPlayer;
