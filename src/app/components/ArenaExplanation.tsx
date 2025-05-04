'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

const images = ['images/1001.png', 'images/1002.png', 'images/1003.png'];

export default function ArenaExplanationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const { volume,playClick } = useAudio();
  const seModalRef = useRef<HTMLAudioElement | null>(null);

  // <audio> 要素として読み込み
  const modalAudioRef = useRef<HTMLAudioElement>(null);

  const open = () => {
    playClick();
    setIsOpen(true);
  };
  const close = () => {
    playClick();
    setIsOpen(false);
    setPage(0);
  };
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setPage(p => (p - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setPage(p => (p + 1) % images.length);
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      seModalRef.current = new Audio('/se/modal.mp3');
    }
  }, []);
  return (
    <>
      {/* 非表示の audio 要素 */}
      <audio ref={modalAudioRef} style={{ display: 'none' }}>
        <source src="/se/modal.mp3" type="audio/mpeg" />
      </audio>

      <button className="btn" onClick={open}>アリーナ説明</button>

      {isOpen && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-page modal-page-left">
              <img
                src={images[page]}
                alt={`説明 ${page + 1}`}
                style={{ maxWidth: '100%', maxHeight: '100%',marginLeft:'7%' }}
              />
            </div>

            <button className="btn-nav btn-prev" onClick={prev}>‹</button>
            <button className="btn-nav btn-next" onClick={next}>›</button>
          </div>
        </div>
      )}
    </>
  );
}
