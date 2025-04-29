
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SavedDeck } from './types';

export default function HomePage() {
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);

  // 保存済みデッキを localStorage から読み込む
  useEffect(() => {
    const list: SavedDeck[] = JSON.parse(
      localStorage.getItem('saved_decks') || '[]'
    );
    setSavedDecks(list);
  }, []);

    // 削除
  const deleteDeck = (id: string) => {
    if (!confirm('本当にこのデッキを削除しますか？')) return;
    const next = savedDecks.filter(d => d.id !== id);
    setSavedDecks(next);
    localStorage.setItem('saved_decks', JSON.stringify(next));
  };

  return (
    <main className="main-board" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      {/* ヒーロー */}
      <h1 style={{
        fontFamily: 'ChalkFont, sans-serif',
        fontSize: '3rem',
        color: '#fff',
        textShadow: '2px 2px 0 #000',
      }}>
        あの頃の自作TCG<br/>アリーナへようこそ！
      </h1>
      <p style={{
        fontFamily: 'ChalkFont, sans-serif',
        fontSize: '1.25rem',
        color: '#fff',
        margin: '1rem 0 3rem',
      }}>
        山本伊吹が開発したオリジナルTCGを<br/>
        オンラインドラフトで再現しよう
      </p>

      {/* アクションボタン */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <Link href="/draft">
          <button className="btn" style={{ fontSize: '1.25rem' }}>
            ドラフトピックを始める
          </button>
        </Link>
        <a href="https://unityroom.com/games/anokorotcg" target="_blank" rel="noopener noreferrer">
          <button className="btn" style={{ fontSize: '1.25rem' }}>
            ゲームを遊ぶ →
          </button>
        </a>
      </div>

      {/* 遊び方サマリー */}
      <section style={{ marginTop: '4rem', color: '#fff' }}>
        <h2 style={{ fontFamily: 'ChalkFont', fontSize: '2rem' }}>遊び方３ステップ</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
          <div>
            <div style={{ fontSize: '2rem' }}>①</div>
            <p>カードをピック</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem' }}>②</div>
            <p>デッキ構築</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem' }}>③</div>
            <p>対戦／共有</p>
          </div>
        </div>
      </section>

      {/* 保存済みデッキ一覧 */}
      <section style={{ color: '#fff', textAlign: 'left', maxWidth: '1000px', marginLeft: '3rem', marginRight: 'auto',marginTop:'-10rem' }}>
        <h2 style={{ fontFamily: 'ChalkFont', fontSize: '2rem' }}>保存済みデッキ一覧</h2>
        {savedDecks.length === 0 ? (
          <p>まだ保存されたデッキがありません。</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem',maxHeight: '200px',overflowY: 'auto', paddingRight: '1rem', }}>
            {savedDecks.map(deck => (
              <li key={deck.id} style={{ marginBottom: '1rem', display:'flex',alignItems:'center',background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ display:'iinline-block',maxWidth:'200px',fontWeight: 'bold', fontSize: '1.1rem', color: '#fff',whiteSpace: 'nowrap',overflow: 'hidden',textOverflow: 'ellipsis', }}>{deck.name}</span>
                <span style={{ margin: '0 1rem', fontSize: '0.9rem', color: '#ddd' }}>
                  ({new Date(deck.savedAt).toLocaleString()})
                </span>
                <Link href={`/draft?load=${deck.id}`}>  
                  <button className="btn" style={{ marginLeft: '1rem' }}>読み込む</button>
                  </Link>
                  <button
              className="btn btn-reset"
              onClick={() => deleteDeck(deck.id)}
              style={{marginLeft:'0.5rem'}}
            >
              削除
            </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
