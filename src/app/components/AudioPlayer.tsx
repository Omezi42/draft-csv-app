'use client';

import { useCallback, useContext, useEffect, useRef } from 'react';
import { AudioContext } from "../context/AudioContext";

type Props = {
  src: string;
  loop?: boolean;
  volume?: number;
}

export default function AudioPlayer({ src }: Props) {
  const { volume } = useContext(AudioContext);
  const audioRef = useRef<HTMLAudioElement>(null);

  // クライアントサイドのみで実行
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
      audio.play().catch(() => {
        console.warn('BGMの再生に失敗しました');
      });
    }
  }, [src]); // src が変更された場合に再実行

  // volume の変更に合わせて音量を変更
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      src={src}
      autoPlay
      style={{ display: 'none' }}
    />
  );
}
