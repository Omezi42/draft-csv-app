'use client';

import Image from 'next/image';
import { Card } from '../types'; // ←Card型定義を共通化しておくと便利

type Props = {
  cards: Card[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function CardModal({ cards, index, onClose, onPrev, onNext }: Props) {
  const card = cards[index];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <Image
          src={`/images/${card.id}.png`}
          alt={card.name}
          width={300} height={300}
        />
        <h2>{card.name}</h2>
        <p>コスト: {card.cost}　パワー: {card.power}</p>
        <p>{card.text}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button className="btn btn-prev" onClick={onPrev}>前</button>
          <button className="btn btn-next" onClick={onNext}>次</button>
        </div>
      </div>
    </div>
  );
}
