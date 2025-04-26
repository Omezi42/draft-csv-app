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

export default function DraftPage() {
  const [pickCandidates, setPickCandidates] = useState<Card[]>([]);
  const [normalEnergyCard, setNormalEnergyCard] = useState<Card | null>(null);
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
    setCurrentPick([...pickCandidates].sort(() => Math.random() - 0.5).slice(0, 3));
  };
  useEffect(() => { if (pickCandidates.length) generatePick(); }, [pickCandidates]);

  // pick handlers
  const handleCardPick = (card: Card) => { setDeck(d => [...d, card]); generatePick(); };
  const handleEnergyPick = () => { if (normalEnergyCard) { setDeck(d => [...d, normalEnergyCard]); generatePick(); } };

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
    const getType = (c: Card) => c.cardType.split(',').map(t => t.trim()).find(t => TYPE_ORDER.includes(t)) || c.cardType;
    const ta = TYPE_ORDER.indexOf(getType(a));
    const tb = TYPE_ORDER.indexOf(getType(b));
    if (ta !== tb) return ta - tb;
    const ca = Number(a.cost) || 0;
    const cb = Number(b.cost) || 0;
    if (ca !== cb) return ca - cb;
    return Number(a.id) - Number(b.id);
  }), [deck]);

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
                  <li key={i} style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => openDeckModal(i)}>
                    {card.name} ({card.cardType})
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div>
            <h1>デッキ一覧</h1>
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(10, auto)', gridAutoFlow: 'column', gap: '1rem' }}>
              {sortedDeck.map((card, i) => (
                <div key={i} style={{ position: 'relative', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{card.cost}</span>
                  <span style={{ position: 'relative', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }} onClick={() => openDeckModal(i)}>
                    {card.name}
                    <img
                      src={`/images/${card.id}.png`}
                      alt=""
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -90,       // カード幅や余白に合わせて調整
                        width: 80,
                        height: 80,
                        clipPath: 'inset(12.5% 10% 55% 10%)',
                        opacity: 0.2,
                        left: '100%',
                        marginLeft: '8px',
                      }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
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
