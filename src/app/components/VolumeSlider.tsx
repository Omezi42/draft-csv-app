// src/components/VolumeSlider.tsx
'use client';

import { useAudio } from "../context/AudioContext";

export function VolumeSlider() {
  const { volume, setVolume } = useAudio();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="volume">🔊</label>
      <input
        id="volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={e => setVolume(+e.target.value)}
      />
    </div>
  );
}
