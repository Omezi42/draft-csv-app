'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { CardModal } from '../components/CardModal';
import { Card } from '../types';
import Papa from 'papaparse';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const totalPicks = 50;
const TYPE_ORDER = ['モンスター', '魔法', '罠', 'フィールド', 'エネルギー'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
const COST_CATEGORIES = ['0', '1', '2', '3', '4', '5', '6', '7+'];

let prevId: string | null = null;

export default function DraftPage() {
  const [pickCandidates, setPickCandidates] = useState<Card[]>([]);
  const [normalEnergyCard, setNormalEnergyCard] = useState<Card | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalIndex, setHistoryModalIndex] = useState(0);
  const [currentPick, setCurrentPick] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  // Deck modal state
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [deckModalIndex, setDeckModalIndex] = useState(0);

  // CSV読み込み
  useEffect(() => {
    fetch('/data/cards.csv')
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const cards = parsed.data as Card[];
        const normal = cards.find(c => c.id === '999') || null;
        setNormalEnergyCard(normal);
        setPickCandidates(cards.filter(c => c.id !== '999'));
      });
  }, []);
  
  // generate picks
  const generatePick = () => {
    if (!pickCandidates.length) return;
    // deck に既に何枚入っているかを数える
    const eligible = pickCandidates.filter(c => {
      const inDeckCount = deck.filter(d => d.id === c.id).length;
      // テキストに「※何枚でも…」があれば無制限
      const unlimited = c.text?.includes('※このカードは何枚でもデッキに入れる事ができる。');
      return unlimited || inDeckCount < 4;
    });
    setCurrentPick(
      eligible
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
    );
  };
  useEffect(() => { if (pickCandidates.length) generatePick(); }, [pickCandidates]);

  // pick handlers
  const handleCardPick = (card: Card) => {
    setDeck(d => [...d, card]);
  };
  const handleEnergyPick = () => {
    if (!normalEnergyCard) return;
    setDeck(d => [...d, normalEnergyCard]);
  };

  // deck が増えたタイミングで新しいピックを生成
  useEffect(() => {
    if (deck.length < totalPicks) {
      generatePick();
    }
  }, [deck]);
  
  // Preview modal handlers
  const openPreview = (idx: number) => { setPreviewIndex(idx); setPreviewOpen(true); };
  const closePreview = () => setPreviewOpen(false);
  const prevPreview = () => setPreviewIndex(i => (i - 1 + currentPick.length) % currentPick.length);
  const nextPreview = () => setPreviewIndex(i => (i + 1) % currentPick.length);

  // Deck modal handlers
  const openDeckModal = (idx: number) => { setDeckModalIndex(idx); setDeckModalOpen(true); };
  const closeDeckModal = () => setDeckModalOpen(false);
  const prevDeck = () => setDeckModalIndex(i => (i - 1 + deck.length) % deck.length);
  const nextDeck = () => setDeckModalIndex(i => (i + 1) % deck.length);

  // type distribution data
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    deck.forEach(c => c.cardType.split(',').map(t => t.trim()).forEach(t => {
      if (TYPE_ORDER.includes(t)) counts[t] = (counts[t] || 0) + 1;
    }));
    return TYPE_ORDER.map((type, idx) => ({ name: type, value: counts[type] || 0, fill: COLORS[idx] }));
  }, [deck]);

  // mana curve data
  const manaData = useMemo(() => {
    const counts: Record<string, number> = {};
    COST_CATEGORIES.forEach(c => counts[c] = 0);
    deck.filter(c => c.cardType.split(',').map(t => t.trim()).includes('モンスター'))
      .forEach(c => {
        const costNum = parseInt(c.cost) || 0;
        const key = costNum > 6 ? '7+' : String(costNum);
        counts[key] += 1;
      });
    return COST_CATEGORIES.map(cost => ({ cost, count: counts[cost] }));
  }, [deck]);

  // sorted deck
  const sortedDeck = useMemo(() => [...deck].sort((a, b) => {
    const getType = (c: Card) =>
      c.cardType.split(',').map(t => t.trim()).find(t => TYPE_ORDER.includes(t))!;
    const ta = TYPE_ORDER.indexOf(getType(a));
    const tb = TYPE_ORDER.indexOf(getType(b));
    if (ta !== tb) return ta - tb;
    const ca = Number(a.cost) || 0;
    const cb = Number(b.cost) || 0;
    if (ca !== cb) return ca - cb;
    return Number(a.id) - Number(b.id);
  }), [deck]);

  let prevId: string | null = null;
  const isDraftComplete = deck.length >= totalPicks;

  return (
    <main style={{ padding: '2rem', backgroundImage: 'url(/images/bg-pattern.png)', backgroundSize: 'cover' }}>
      {/* Draft area or DeckList area */}
      <section style={{ marginBottom: '2rem' }}>
        {!isDraftComplete ? (
          <>  {/* Draft in full width */}
            <h1>ドラフト画面</h1>
            <p>デッキ枚数: {deck.length} / {totalPicks}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {currentPick.map((card, idx) => (
                <div key={card.id} style={{ width: '140px', textAlign: 'center' }}>
                  <img
                    src={`/images/${card.id}.png`}
                    alt={card.name}
                    style={{ width: '100%', cursor: 'pointer' }}
                    onClick={() => openPreview(idx)}
                  />
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => openPreview(idx)}>
                    {card.name}
                  </div>
                  <button onClick={() => handleCardPick(card)} className="btn">選択</button>
                </div>
              ))}
              {normalEnergyCard && (
                <div style={{ width: '140px', textAlign: 'center' }}>
                  <img
                    src={`/images/${normalEnergyCard.id}.png`}
                    alt="ノーマルエネルギー"
                    style={{ width: '100%', cursor: 'pointer' }}
                    onClick={() => openPreview(currentPick.length)}
                  />
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => openPreview(currentPick.length)}>ノーマルエネルギー</div>
                  <button onClick={handleEnergyPick} className="btn">選択</button>
                </div>
              )}
            </div>
            <div style={{ marginTop: '2rem' }}>
              <h3>ピック履歴</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
              {deck.map((card, i) => (
    <li key={i}
        onClick={() => {
          setHistoryModalIndex(i);
          setHistoryModalOpen(true);
        }}
        style={{cursor: 'pointer', textDecoration: 'underline'}}>
      {card.name} ({card.cardType})
    </li>
  ))}
              </ul>
            </div>
          </>
        ) : (
           <section>
              <h1>デッキ一覧</h1>
              <div style={{
                display: 'grid',
                gridTemplateRows: 'repeat(10, auto)',
                gridAutoFlow: 'column',
                gap: 12,
              }}>
                {/* …省略… */}
{sortedDeck.map((card, i) => {
  const badgeWidth = 40;
  const showCost = card.id !== prevId;
  prevId = card.id;

  return (
    // カード＋コストを横一列に
    <div
      key={i}
      style={{
        display: 'flex',
        marginLeft: showCost ? 0 : badgeWidth,
        alignItems: 'stretch',     // 高さを揃える
        gap: 0,                    // バッジと枠はぴったりくっつける
      }}
    >
      {/* コストバッジ */}
      {showCost && (
        <div
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '0 15px',              // 横は余白、縦は枠に合わせる
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
          }}
        >
          {card.cost}
        </div>
      )}

      {/* カード枠 */}
      <div
        style={{
          position: 'relative',
          border: '1px solid #999',
          borderRadius: showCost ? '0 4px 4px 0' : '4px',
          padding: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexGrow: 1,                   // 枠部分が残り幅を使う
        }}
        onClick={() => openDeckModal(i)}
      >
        <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>
          {card.name}
        </span>

        {/* 背景イメージ */}
        <img
          src={`/images/${card.id}.png`}
          alt={card.name}
          style={{
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-30%)',
            height: 100,
            width: 'auto',
            objectFit: 'contain',
            clipPath: 'inset(12.5% 10% 55% 10%)',
            opacity: 0.2,
            zIndex: 0,
          }}
        />
      </div>
    </div>
  );
})}
{/* …省略… */}

              </div>
            </section>
          )}
        </section>
      {/* Charts */}
      <section>
        {deck.length > 0 && (
          <>  {/* Charts always full width below draft/deck listing */}
            <h3>タイプ分布</h3>
            <PieChart width={300} height={300}>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false}>
                {typeData.map((d, idx) => <Cell key={idx} fill={d.fill} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {typeData.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: d.fill, display: 'inline-block' }} />
                  <span>{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
            <h3 style={{ marginTop: '2rem' }}>マナカーブ</h3>
            <BarChart width={400} height={300} data={manaData} margin={{ bottom: 20 }}>
              <XAxis dataKey="cost" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </>
        )}
      </section>

      {/* Modals */}
      {previewOpen && (
        <CardModal
          cards={[...currentPick, ...(normalEnergyCard ? [normalEnergyCard] : [])]}
          index={previewIndex}
          onClose={closePreview}
          onPrev={prevPreview}
          onNext={nextPreview}
        />
      )}
      {/* 履歴専用モーダル */}
{historyModalOpen && (
  <CardModal
    cards={deck}                    // ソート前の deck
    index={historyModalIndex}
    onClose={() => setHistoryModalOpen(false)}
    onPrev={() => setHistoryModalIndex(i => (i - 1 + deck.length) % deck.length)}
    onNext={() => setHistoryModalIndex(i => (i + 1) % deck.length)}
  />
)}
      {deckModalOpen && (
        <CardModal
          cards={sortedDeck}
          index={deckModalIndex}
          onClose={closeDeckModal}
          onPrev={prevDeck}
          onNext={nextDeck}
        />
      )}
    </main>
  );
}
 