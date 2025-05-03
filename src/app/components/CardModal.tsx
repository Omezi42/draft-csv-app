'use client';

import Image from 'next/image';
import { Card } from '../types';

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
      <div className="modal-content">
        {/* ノート見開きページ風背景 */}
        {/* 左ページ：カード画像 */}
        <div className="modal-page modal-page-left">
          <Image
            src={`/images/${card.id}.png`}
            alt={card.name}
            width={300}
            height={300}
            style={{
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%',
              marginLeft: '5vw'
            }}
          />
        </div>
        {/* 右ページ：カードテキスト */}
        <div className="modal-page modal-page-right">
          <h2 className="card-name" style={{color:'black'}}>{card.name}</h2>
          <p className="card-stats" style={{color:'black'}}>コスト: {card.cost}　パワー: {card.power}</p>
          <p className="card-text" style={{color:'black',maxWidth:'60vh'}}>{card.text}</p>
        </div>
        {/* 前後ボタンをページ端に配置 */}
        <button className="btn-nav btn-prev" onClick={e => { e.stopPropagation(); onPrev(); }}>‹</button>
        <button className="btn-nav btn-next" onClick={e => { e.stopPropagation(); onNext(); }}>›</button>
      </div>
    </div>
  );
}
