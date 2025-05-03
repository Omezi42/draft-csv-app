'use client';

import { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';

export default function GlobalBgmPlayer() {
  const { volume } = useAudio();
  const bgmRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const audio = bgmRef.current!;
      audio.loop = true;
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  }, [volume]);

  return <audio ref={bgmRef} src="/bgm/draft-loop.mp3" style={{ display: 'none' }} />;
}
