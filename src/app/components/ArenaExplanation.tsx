'use client';

import React, { useState } from 'react';

const images = ['images/1001.png', 'images/1002.png', 'images/1003.png'];

export default function ArenaExplanationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setPage(0);
  };
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage(p => (p - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage(p => (p + 1) % images.length);
  };

  return (
    <>
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
