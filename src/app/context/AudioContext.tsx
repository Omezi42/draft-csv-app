'use client';
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface AudioContextProps {
  volume: number;
  setVolume: (v: number) => void;
  playClick: () => void;
}

export const AudioContext = createContext<AudioContextProps>({
  volume: 1,
  setVolume: () => {},
  playClick: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(0.5);
  const clickAudio = useRef<HTMLAudioElement>(new Audio('/se/click.mp3'));

  const playClick = () => {
    const audio = clickAudio.current;
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  return (
    <AudioContext.Provider value={{ volume, setVolume, playClick }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
}
