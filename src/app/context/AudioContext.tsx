'use client';
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

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
  const clickAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // クライアントマウント後に Audio を初期化
    clickAudio.current = new Audio('/se/click.mp3');
  }, []);

  const playClick = () => {
    const audio = clickAudio.current;
    if (!audio) return;
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
