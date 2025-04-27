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
  ResponsiveContainer,
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
  const [isReadyForDeckList, setIsReadyForDeckList] = useState(false);

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
    const eligible = pickCandidates.filter(c => {
      const inDeckCount = deck.filter(d => d.id === c.id).length;
      const unlimited = c.text?.includes(
        '※このカードは何枚でもデッキに入れる事ができる。',
      );
      return unlimited || inDeckCount < 4;
    });
    setCurrentPick(
      eligible.sort(() => Math.random() - 0.5).slice(0, 3)
    );
  };
  useEffect(() => {
    if (pickCandidates.length) generatePick();
  }, [pickCandidates]);

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
  const openPreview = (idx: number) => {
    setPreviewIndex(idx);
    setPreviewOpen(true);
  };
  const closePreview = () => setPreviewOpen(false);
  const prevPreview = () =>
    setPreviewIndex(i => (i - 1 + currentPick.length) % currentPick.length);
  const nextPreview = () =>
    setPreviewIndex(i => (i + 1) % currentPick.length);

  // Deck modal handlers
  const openDeckModal = (idx: number) => {
    setDeckModalIndex(idx);
    setDeckModalOpen(true);
  };
  const closeDeckModal = () => setDeckModalOpen(false);
  const prevDeck = () =>
    setDeckModalIndex(i => (i - 1 + deck.length) % deck.length);
  const nextDeck = () => setDeckModalIndex(i => (i + 1) % deck.length);

  // type distribution data
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    deck.forEach(c =>
      c.cardType
        .split(',')
        .map(t => t.trim())
        .forEach(t => {
          if (TYPE_ORDER.includes(t)) counts[t] = (counts[t] || 0) + 1;
        }),
    );
    return TYPE_ORDER.map((type, idx) => ({
      name: type,
      value: counts[type] || 0,
      fill: COLORS[idx],
    }));
  }, [deck]);

  // mana curve data
  const manaData = useMemo(() => {
    const counts: Record<string, number> = {};
    COST_CATEGORIES.forEach(c => (counts[c] = 0));
    deck
      .filter(c => {
        const types = c.cardType.split(',').map(t => t.trim());
        return ['モンスター', '魔法', 'フィールド'].some(type =>
          types.includes(type),
        );
      })
      .forEach(c => {
        const costNum = parseInt(c.cost) || 0;
        const key = costNum > 6 ? '7+' : String(costNum);
        counts[key] += 1;
      });
    return COST_CATEGORIES.map(cost => ({ cost, count: counts[cost] }));
  }, [deck]);

  // sorted deck
  const sortedDeck = useMemo(
    () =>
      [...deck].sort((a, b) => {
        const getType = (c: Card) =>
          c.cardType
            .split(',')
            .map(t => t.trim())
            .find(t => TYPE_ORDER.includes(t))!;
        const ta = TYPE_ORDER.indexOf(getType(a));
        const tb = TYPE_ORDER.indexOf(getType(b));
        if (ta !== tb) return ta - tb;
        const ca = Number(a.cost) || 0;
        const cb = Number(b.cost) || 0;
        if (ca !== cb) return ca - cb;
        return Number(a.id) - Number(b.id);
      }),
    [deck],
  );

  const hasPickedAll = deck.length >= totalPicks;
  const showDeckList = hasPickedAll && isReadyForDeckList;

  return (
    <main className="main-board">
      {/* Draft area or DeckList area */}
      <section>
        {!showDeckList && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <h1>
                <div
                  style={{
                    fontSize: 30,
                    marginLeft: '5rem',
                    marginTop:'2rem'
                  }}
                >
                  カード選択
                </div>
              </h1>

              {normalEnergyCard && (
                <div
                  style={{
                    width: '140px',
                    marginLeft: '17rem',
                    marginTop:'2rem'
                  }}
                >
                  <button
                    className="btn"
                    disabled={hasPickedAll}
                    style={{
                      opacity: hasPickedAll ? 0.5 : 1,
                      cursor: hasPickedAll ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => {
                      if (hasPickedAll) return;
                      handleEnergyPick();
                    }}
                  >
                    ノーマルエネルギーを選択
                  </button>
                </div>
              )}

              <div
                style={{
                  marginLeft: '17rem',
                  fontSize: 30,
                  marginTop:'2rem'
                }}
              >
                <h3>ピック履歴</h3>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginLeft: '4rem',
              }}
            >
              {currentPick.map((card, idx) => (
                <div
                  key={card.id}
                  className={`card-frame-${idx + 1}`}
                  style={{
                    width: '18%',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={`/images/${card.id}.png`}
                    alt={card.name}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      pointerEvents: hasPickedAll ? 'none' : 'auto',
                      opacity: hasPickedAll ? 0 : 1,
                    }}
                    onClick={() => openPreview(idx)}
                  />
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: 'black',
                      pointerEvents: hasPickedAll ? 'none' : 'auto',
                      opacity: hasPickedAll ? 0 : 1,
                    }}
                    onClick={() => openPreview(idx)}
                  >
                    {card.name}
                  </div>
                  <button
                    className="btn"
                    disabled={hasPickedAll}
                    style={{
                      cursor: hasPickedAll ? 'not-allowed' : 'pointer',
                      opacity: hasPickedAll ? 0.5 : 1,
                      height:'13%'
                    }}
                    onClick={() => {
                      if (hasPickedAll) return;
                      handleCardPick(card);
                    }}
                  >
                    選択
                  </button>
                </div>
              ))}

              <div style={{ marginLeft: '1rem' }}>
                <p>
                  デッキ枚数: {deck.length} / {totalPicks}
                </p>
                <div
                  style={{
                    height: '330px',
                    width: '400px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '0.5rem',
                  }}
                >
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {deck.map((card, i) => (
                      <li
                        key={i}
                        style={{
                          padding: '0.25rem 0',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        onClick={() => openDeckModal(i)}
                      >
                        {card.name} ({card.cardType})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Charts */}
      <section>
        {!showDeckList && (
          <div
            className="charts"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '4rem',
              marginBottom: '10rem',
            }}
          >
            <PieChart width={200} height={200}>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
              >
                {typeData.map((d, idx) => (
                  <Cell key={idx} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>

            <div className="legend" style={{ marginLeft: '0.5rem' }}>
              {typeData.map((d, idx) => (
                <div
                  key={idx}
                  style={{ fontFamily: 'ChalkFont', color: '#fff' }}
                >
                  ■ {d.name}: {d.value} 枚
                </div>
              ))}
            </div>

            <ResponsiveContainer width="40%" height={200}>
              <BarChart
                data={manaData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis
                  dataKey="cost"
                  stroke="#fff"
                  tick={{ fontFamily: 'ChalkFont', fill: '#fff' }}
                />
                <YAxis
                  stroke="#fff"
                  tick={{ fontFamily: 'ChalkFont', fill: '#fff' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#333', borderRadius: 4 }}
                  itemStyle={{ fontFamily: 'ChalkFont', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>

            {/* ↓ 常に表示されるけど、50枚未満のときはdisabled */}
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              {hasPickedAll && <h2>ピックが完了しました！</h2>}
              <button
                className="btn"
                disabled={!hasPickedAll}
                onClick={() => {
                  if (!hasPickedAll) return;
                  setIsReadyForDeckList(true);
                }}
                style={{
                  opacity: hasPickedAll ? 1 : 0.5,
                  cursor: hasPickedAll ? 'pointer' : 'not-allowed',
                }}
              >
                デッキ一覧を表示する
              </button>
            </div>
          </div>
        )}

        {showDeckList && (
          <section style={{maxWidth: '90%',margin: '0 auto',padding: '2rem 0',textAlign:'center',width:'100%'}}>
            <h1 style={{margin:0,fontWeight:'bold',fontSize:30,}}>アリーナデッキ</h1>
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateRows: 'repeat(10, auto)',
                gridAutoFlow: 'column',
                gap: 12,
              }}
            >
              {sortedDeck.map((card, i) => {
                const badgeWidth = 40;
                const showCost = card.id !== prevId;
                prevId = card.id;

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      marginLeft: showCost ? 0 : badgeWidth,
                      alignItems: 'stretch',
                      gap: 0,
                      backgroundColor: 'white',
                      borderRadius: '5px',
                    }}
                    onClick={() => openDeckModal(i)}
                  >
                    {showCost && (
                      <div
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          padding: '0 15px',
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
                    <div
                      style={{
                        position: 'relative',
                        border: '1px solid #999',
                        borderRadius: showCost
                          ? '0 4px 4px 0'
                          : '4px',
                        padding: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexGrow: 1,
                      }}
                    >
                      <span style={{ fontWeight: 'bold',color:'black' }}>
                        {card.name}
                      </span>
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
            </div>
          </section>
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
      {historyModalOpen && (
        <CardModal
          cards={deck}
          index={historyModalIndex}
          onClose={() => setHistoryModalOpen(false)}
          onPrev={() =>
            setHistoryModalIndex(i => (i - 1 + deck.length) % deck.length)
          }
          onNext={() =>
            setHistoryModalIndex(i => (i + 1) % deck.length)
          }
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
