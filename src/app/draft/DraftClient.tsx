'use client';
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import { CardModal } from '../components/CardModal';
import { Card } from '../types';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { SavedDeck } from '../types';
import { Menu } from '../components/Menu';
import { useAudio } from '../context/AudioContext';
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
import Link from 'next/link';

const totalPicks = 50;
const TYPE_ORDER = ['モンスター', '魔法', '罠', 'フィールド', 'エネルギー'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
const COST_CATEGORIES = ['0', '1', '2', '3', '4', '5', '6', '7+'];

export default function DraftPage() {
  const searchParams = useSearchParams();
  const load = searchParams.get('load');
  const router = useRouter();
  const { volume, playClick } = useAudio();
  const bgmRef = useRef<HTMLAudioElement>(null);

  const seClickRef = useRef<HTMLAudioElement>(null);
  const sePickRef = useRef<HTMLAudioElement>(null);
  const seModalRef = useRef<HTMLAudioElement | null>(null);

  const [pickCandidates, setPickCandidates] = useState<Card[]>([]);
  const [normalEnergyCard, setNormalEnergyCard] = useState<Card | null>(null);
  const [currentPick, setCurrentPick] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('draft_deck');
    return saved ? JSON.parse(saved) : [];
    });
  const [isReadyForDeckList, setIsReadyForDeckList] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalIndex, setHistoryModalIndex] = useState(0);
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [deckModalIndex, setDeckModalIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [seVolume,  setSeVolume]  = useState(0.5);

  useEffect(() => {
    if (typeof load === 'string') {
      const list: SavedDeck[] =
        JSON.parse(localStorage.getItem('saved_decks') || '[]');
      const found = list.find(d => d.id === load);
      if (found) {
        setDeck(found.cards);
        setIsReadyForDeckList(true);
      }
    }
  }, [load]);

// deck が更新されるたびに localStorage に保存
  useEffect(() => {
  localStorage.setItem('draft_deck', JSON.stringify(deck));
  }, [deck]);

  // CSV 読み込み
  useEffect(() => {
    fetch('/data/cards.csv')
      .then(res => res.text())
      .then(text => {
        const { data } = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });
        const cards = data as Card[];
        setNormalEnergyCard(cards.find(c => c.id === '999') || null);
        setPickCandidates(cards.filter(c => c.id !== '999'));
      });
  }, []);

  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => {});
  }, [volume]);

  // ピック生成
  const generatePick = () => {
    if (!pickCandidates.length) return;
    const eligible = pickCandidates.filter(c => {
      const countInDeck = deck.filter(d => d.id === c.id).length;
      const unlimited = c.text?.includes(
        '※このカードは何枚でもデッキに入れる事ができる。',
      );
      return unlimited || countInDeck < 4;
    });
    setCurrentPick(
      eligible.sort(() => Math.random() - 0.5).slice(0, 3),
    );
  };

  useEffect(() => {
    if (pickCandidates.length) generatePick();
  }, [pickCandidates]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sePickRef.current = new Audio('/se/pick.mp3');
    }
  }, []); 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      seModalRef.current = new Audio('/se/modal.mp3');
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      seClickRef.current = new Audio('/se/click.mp3');
    }
  }, []);

  const handleCardPick = (card: Card) => {
    const audio = sePickRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setDeck(d => [...d, card]);
  };
  
  const handleEnergyPick = () => {
    const audio = sePickRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    if (normalEnergyCard) {
      setDeck(d => [...d, normalEnergyCard]);
    }
  };
  
  // deck が増えたら次ピック
  useEffect(() => {
    if (deck.length < totalPicks) generatePick();
  }, [deck]);

  // モーダル操作
  const openPreview = (i: number) => {
    setPreviewIndex(i);
    setPreviewOpen(true);
  };
  const closePreview = () => setPreviewOpen(false);
  const prevPreview = () =>{
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setPreviewIndex(i => (i - 1 + currentPick.length) % currentPick.length)};
  const nextPreview = () =>{
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setPreviewIndex(i => (i + 1) % currentPick.length)};

  const openHistoryModal = (i: number) => {
    setHistoryModalIndex(i);
    setHistoryModalOpen(true);
  };
  const closeHistoryModal = () => setHistoryModalOpen(false);
  const prevHistory = () =>{
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setHistoryModalIndex(i => (i - 1 + deck.length) % deck.length)};
  const nextHistory = () =>{
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setHistoryModalIndex(i => (i + 1) % deck.length)};

  const openDeckModal = (i: number) => {
    setDeckModalIndex(i);
    setDeckModalOpen(true);
  };
  const closeDeckModal = () => setDeckModalOpen(false);
  const prevDeck = () =>{
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setDeckModalIndex(i => (i - 1 + deck.length) % deck.length)};
  const nextDeck = () =>{
    const audio = seModalRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    }
    setDeckModalIndex(i => (i + 1) % deck.length)};

  // グラフ用データ
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
    return TYPE_ORDER.map((type, i) => ({
      name: type,
      value: counts[type] || 0,
      fill: COLORS[i],
    }));
  }, [deck]);

  const manaData = useMemo(() => {
    const counts: Record<string, number> = {};
    COST_CATEGORIES.forEach(c => (counts[c] = 0));
    deck
      .filter(c => {
        const ts = c.cardType.split(',').map(t => t.trim());
        return ['モンスター', '魔法', 'フィールド'].some(t => ts.includes(t));
      })
      .forEach(c => {
        const n = parseInt(c.cost) || 0;
        const key = n > 6 ? '7+' : String(n);
        counts[key]++;
      });
    return COST_CATEGORIES.map(cost => ({
      cost,
      count: counts[cost],
    }));
  }, [deck]);

  // ソート済みデッキ
  let prevId: string | null = null;
  const sortedDeck = useMemo(
    () =>
      [...deck].sort((a, b) => {
        const ga = a.cardType
          .split(',')
          .map(t => t.trim())
          .find(t => TYPE_ORDER.includes(t))!;
        const gb = b.cardType
          .split(',')
          .map(t => t.trim())
          .find(t => TYPE_ORDER.includes(t))!;
        const ia = TYPE_ORDER.indexOf(ga);
        const ib = TYPE_ORDER.indexOf(gb);
        if (ia !== ib) return ia - ib;
        const ca = Number(a.cost) || 0;
        const cb = Number(b.cost) || 0;
        if (ca !== cb) return ca - cb;
        return Number(a.id) - Number(b.id);
      }),
    [deck],
  );
  const deckRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const exportClipboardBtnRef = useRef<HTMLButtonElement>(null);
  const exportDownloadBtnRef = useRef<HTMLButtonElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);

// 共有で使うキャプチャ本体
async function captureDeckCanvas(): Promise<Blob> {
  if (!mainRef.current) throw new Error('mainRef がありません');
  const canvas = await html2canvas(mainRef.current, {
    backgroundColor: null,
    useCORS: true,
    scale: 1,
    ignoreElements: el => el.hasAttribute('data-ignore-export'),
  });
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!)));
}

// クリップボードにコピー
async function copyDeckImageToClipboard() {
  const blob = await captureDeckCanvas();
  await navigator.clipboard.write([ new ClipboardItem({ [blob.type]: blob }) ]);
}

// ダウンロード
async function downloadDeckImage() {
  const blob = await captureDeckCanvas();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ArenaDeck.png';
  a.click();
  URL.revokeObjectURL(url);
  }
  const onSaveDeck = () => {
  const name = window.prompt('このデッキの名前を入力してください');
  if (!name) return;
  // 既存保存配列を localStorage から取得
  const existing: SavedDeck[] =
    JSON.parse(localStorage.getItem('saved_decks') || '[]');
  const newDeck: SavedDeck = {
    id: crypto.randomUUID(),
    name,
    cards: deck,
    savedAt: Date.now(),
  };
  localStorage.setItem(
    'saved_decks',
    JSON.stringify([ newDeck, ...existing ])
  );
  alert(`「${name}」として保存しました！`);
};
const handleReset = () => {
    if (confirm('本当にドラフトをリセットしますか？')) {
      setDeck([]);
      setCurrentPick([]);
      localStorage.removeItem('draft_deck');
      generatePick();
      setIsReadyForDeckList(false);
    }
  };

  const hasPickedAll = deck.length >= totalPicks;
  const showDeckList = hasPickedAll && isReadyForDeckList;

  return (
    <>
    <main
      className="main-board"
      ref={mainRef}
      style={{
        display: 'grid',
        gridTemplateColumns: '5fr 3fr',
        padding: '2rem',
        backgroundImage: 'url(/images/bg-pattern.png)',
        backgroundSize: 'cover',
        position:'relative'
      }}
    >
        <Menu
          menuOpen={menuOpen}
          menuMode={showDeckList ? 'deck' : 'draft'}
          onToggle={() => { playClick(); setMenuOpen(o => !o); }}
          showDeckList={showDeckList}
          hasPickedAll={hasPickedAll}
          handleReset={handleReset}
          setIsReadyForDeckList={setIsReadyForDeckList}
          copyDeckImageToClipboard={copyDeckImageToClipboard}
          downloadDeckImage={downloadDeckImage}
          onSaveDeck={onSaveDeck}
          draftHref="/draft"
          gameHref="https://unityroom.com/games/anokorotcg"
        />
      <button onClick={()=>{
        playClick();
        setMenuOpen(o=>!o);
      }}
      data-ignore-export
      style={{
        position: 'absolute',
        top: '7%',
        right: '5%',
        width: 32, height: 32,
        borderRadius: 4,
        fontSize: 24,
        background: 'rgba(0,0,0,0.5)',
        border: 'none',
        cursor: 'pointer',
      }}>
        ☰
      </button>  
      {/* ドラフト画面 */}
      <div
        className="draft-ui"
        style={{
          display: showDeckList ? 'none' : 'flex',
          width: '100%',
          gridColumn: '1 / -1',
        }}
      >
        {/* 左カラム */}
        <div className="left-panel" style={{ flex: 5, marginTop: '1rem' }}>
          <section className="draft-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 className="section-title" style={{ marginLeft: '5%', whiteSpace: 'nowrap' }}>
                カード選択
              </h2>
              {normalEnergyCard && (
                <button
                  className="btn energy-btn"
                  disabled={hasPickedAll}
                  onClick={handleEnergyPick}
                  style={{
                    opacity: hasPickedAll ? 0.5 : 1,
                    cursor: hasPickedAll ? 'not-allowed' : 'pointer',
                    marginLeft: '30%',
                  }}
                >
                  ノーマルエネルギーを選択
                </button>
              )}
            </div>
            <div className="draft-controls" style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className="draft-candidates"
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginLeft: '2rem' }}
              >
                {currentPick.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`card-frame-${idx + 1}`}
                    style={{ width: '30%', textAlign: 'center' }}
                  >
                    <img
                      src={`/images/${card.id}.png`}
                      alt={card.name}
                      onClick={() => {playClick();openPreview(idx)}}
                      style={{
                        width: '100%',
                        cursor: hasPickedAll ? 'not-allowed' : 'pointer',
                        pointerEvents: hasPickedAll ? 'none' : 'auto',
                        opacity: hasPickedAll ? 0 : 1,
                      }}
                    />
                    <div
                      onClick={() => {playClick();openPreview(idx)}}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: 'underline',
                        cursor: hasPickedAll ? 'default' : 'pointer',
                        color: 'black',
                        pointerEvents: hasPickedAll ? 'none' : 'auto',
                        opacity: hasPickedAll ? 0 : 1,
                      }}
                    >
                      {card.name}
                    </div>
                    <button
                      className="btn"
                      disabled={hasPickedAll}
                      onClick={() => handleCardPick(card)}
                      style={{
                        cursor: hasPickedAll ? 'not-allowed' : 'pointer',
                        opacity: hasPickedAll ? 0.5 : 1,
                        height: '13%',
                      }}
                    >
                      選択
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
  
          {/* グラフ */}
          <section className="stats-section">
            <div className="charts" style={{ display: 'flex', alignItems: 'center', marginLeft: '2rem' }}>
              <PieChart width={200} height={200}>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                  {typeData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
              <div className="legend" style={{ marginLeft: '0.5rem' }}>
                {typeData.map((d, i) => (
                  <div key={i} style={{ fontFamily: 'ChalkFont', color: '#fff' }}>
                    ■ {d.name}: {d.value} 枚
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="40%" height={200}>
                <BarChart data={manaData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis dataKey="cost" stroke="#fff" tick={{ fontFamily: 'ChalkFont', fill: '#fff' }} />
                  <YAxis stroke="#fff" tick={{ fontFamily: 'ChalkFont', fill: '#fff' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', borderRadius: 4 }} itemStyle={{ fontFamily: 'ChalkFont', color: '#fff' }} />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* 右カラム：ピック履歴 + 切り替えボタン */}
        <div
          className="right-panel"
          style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 3 }}
        >
          <section
            className="history-section"
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
              }}
            >
              <h2 className="section-title">ピック履歴</h2>
            </div>

            <p>デッキ枚数: {deck.length} / {totalPicks}</p>

            <div
              style={{
                flex: '1 1 auto',
                minHeight: '55vh',
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '0.5rem',
              }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {deck.map((card, i) => (
                  <li
                    key={i}
                    onClick={() => {playClick();openHistoryModal(i)}}
                    style={{
                      padding: '0.25rem 0',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {card.name} ({card.cardType})
                  </li>
                ))}
              </ul>
            </div>

            <section
              className="toggle-decklist-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 0',
              }}
            >
              <button
                className="btn"
                disabled={!hasPickedAll}
                onClick={() => {playClick();setIsReadyForDeckList(true)}}
                style={{
                  opacity: hasPickedAll ? 1 : 0.5,
                  cursor: hasPickedAll ? 'pointer' : 'not-allowed',
                  marginTop: '1rem',
                }}
              >
                デッキ一覧を表示する
              </button>
            </section>
          </section>
        </div>
      </div>

      {/** ──────────────── */}
      {/** デッキ一覧画面（全幅表示） ──────────────── */}
      <section
  ref={deckRef}
  className="decklist-section"
  style={{
    display: showDeckList ? 'block' : 'none',
    gridColumn: '1 / -1',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '2rem 0',
  }}
>
  <h2
    className="section-title"
    style={{
      marginTop: '-1rem',
      marginBottom: '2rem',
      paddingBottom: '0',
      lineHeight: 1.2,
      padding:'0 1rem',
    }}
  >
    アリーナデッキ
  </h2>

  <div
  style={{
    display: 'grid',
    /* auto-fit + minmax で「幅150px以上は伸び縮み可」な列を自動生成 */
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(10, auto)',
    gap: '0.5rem',
    padding: '0 1rem',
  }}
>
  {sortedDeck.map((card, i) => {
    const showCost = card.id !== prevId;
    prevId = card.id;
    return (
      <div
        key={i}
        onClick={() => { playClick(); openDeckModal(i); }}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          marginLeft: showCost ? 0 : 40,
          backgroundColor: 'white',
          borderRadius: 5,
        }}
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
              cursor: 'pointer',
            }}
          >
            {card.cost}
          </div>
        )}

        <div
          style={{
            position: 'relative',
            border: '1px solid #999',
            borderRadius: showCost ? '0 4px 4px 0' : '4px',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexGrow: 1,
            cursor: 'pointer',
          }}
        >
          {/* 可変幅に対応させるため、固定幅を解除 */}
          <span
            style={{
              display: 'inline-block',
              /* 幅は親グリッド（minmax）に任せる or % 指定 */
              fontWeight: 'bold',
              color: 'black',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.name}
          </span>
          <div
            style={{
              position: 'absolute',
              width: '70px',
              height: '30px',
              overflow: 'hidden',
              left: 'calc(60%)',
            }}
          >
            <img
              src={`/images/${card.id}.png`}
              alt={card.name}
              style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                /* 固定100pxをやめて、maxHeightで調整 */
                maxHeight: '100px',
                width: 'auto',
                opacity: 0.2,
                zIndex: 0,
                transform: 'translateY(-30%)',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>
    );
  })}
</div>
</section>

      {/** モーダル群（共通） */}
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
          onClose={closeHistoryModal}
          onPrev={prevHistory}
          onNext={nextHistory}
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
    </>
  );
}