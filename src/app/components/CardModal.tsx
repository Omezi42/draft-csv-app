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
        <div style={{width: '100%',display: 'flex',justifyContent: 'center',marginBottom: '1rem',}}>
        <Image
          src={`/images/${card.id}.png`}
          alt={card.name}
          style={{objectFit: 'contain',maxHeight: '60%',maxWidth: '100%'}}
          width='300' height='300'
        />
        </div>
        <h2 style={{color:'black'}}>{card.name}</h2>
        <p style={{color:'black'}}>コスト: {card.cost}　パワー: {card.power}</p>
        <p style={{color:'black'}}>{card.text}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem',width:'100%' }}>
          <button className="btn btn-prev" onClick={onPrev}>前</button>
          <button className="btn btn-next" onClick={onNext}>次</button>
        </div>
      </div>
    </div>
  );
}
