'use client';

import { useEffect, useState } from 'react';

type Card = {
  id: string;
  name: string;
  cost: string;
  power: string;
  types: string;
  text: string;
  cardType: string;
};

const totalPicks = 50; // ドラフトで選ぶ枚数

// 配列からランダムに n 件をユニークに抽出するヘルパー
function sampleUnique<T>(arr: T[], n: number): T[] {
  const result: T[] = [];
  const copy = [...arr];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export default function DraftPage() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [pickCandidates, setPickCandidates] = useState<Card[]>([]);
  const [normalEnergyCard, setNormalEnergyCard] = useState<Card | null>(null);
  const [currentPick, setCurrentPick] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);

  // CSVから全カード読み込み
  useEffect(() => {
    fetch('/data/cards.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.trim().split('\n');
        const headers = rows[0].split(',');
        const cards: Card[] = rows.slice(1).map(row => {
          const values = row.split(',');
          const card: any = {};
          headers.forEach((h, i) => (card[h.trim()] = values[i]?.trim()));
          return card as Card;
        });
        setAllCards(cards);

        // ノーマルエネルギーをIDで取得（IDが '999'）
        const normalEnergy = cards.find(c => c.id === '999') || null;
        setNormalEnergyCard(normalEnergy);

        // ノーマルエネルギーのみを除外した候補リストを作成
        setPickCandidates(cards.filter(c => c.id !== '999'));
      });
  }, []);

  // currentPick 初期化 & 再生成
  const generatePick = () => {
    if (pickCandidates.length === 0) return;
    const pick = sampleUnique(pickCandidates, 3);
    setCurrentPick(pick);
  };

  // 候補リスト読み込み後、最初のピック
  useEffect(() => {
    if (pickCandidates.length > 0) {
      generatePick();
    }
  }, [pickCandidates]);

  // カード選択
  const handleCardPick = (pickedCard: Card) => {
    setDeck(prev => [...prev, pickedCard]);
    generatePick();
  };

  // ノーマルエネルギー選択
  const handleEnergyPick = () => {
    if (!normalEnergyCard) return;
    setDeck(prev => [...prev, normalEnergyCard]);
    generatePick();
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>ドラフト画面</h1>
      <p>デッキ枚数: {deck.length} / {totalPicks}</p>

      {deck.length < totalPicks ? (
        <>
          <h2>次の１枚を選択してください</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {currentPick.map((card) => (
              <div
                key={card.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '8px',
                  width: '140px',
                  textAlign: 'center'
                }}
              >
                <img
                  src={`/images/${card.id}.png`}
                  alt={card.name}
                  style={{ width: '100%', height: 'auto', marginBottom: '0.5rem' }}
                />
                <strong>{card.name}</strong>
                <p>コスト: {card.cost}</p>
                <button onClick={() => handleCardPick(card)}>Pick</button>
              </div>
            ))}
            {normalEnergyCard && (
              <div
                key={normalEnergyCard.id}
                style={{
                  border: '1px dashed #999',
                  padding: '1rem',
                  borderRadius: '8px',
                  width: '140px',
                  textAlign: 'center'
                }}
              >
                <img
                  src={`/images/${normalEnergyCard.id}.png`}
                  alt={normalEnergyCard.name}
                  style={{ width: '100%', height: 'auto', marginBottom: '0.5rem' }}
                />
                <strong>{normalEnergyCard.name}</strong>
                <button onClick={handleEnergyPick}>Pick</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <h2>ドラフト完了！</h2>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h3>現在のデッキ</h3>
        <ul>
          {deck.map((card, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={`/images/${card.id}.png`}
                alt={card.name}
                style={{ width: '40px', height: 'auto' }}
              />
              {card.name} (コスト:{card.cost})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
