'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SavedDeck } from './types';
import { Menu } from './components/Menu';
import { useAudio } from './context/AudioContext';

export default function HomePage() {
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playClick } = useAudio();

  useEffect(() => {
    const list: SavedDeck[] = JSON.parse(localStorage.getItem('saved_decks') || '[]');
    setSavedDecks(list);
  }, []);

  const deleteDeck = (id: string) => {
    if (!confirm('本当にこのデッキを削除しますか？')) return;
    const next = savedDecks.filter(d => d.id !== id);
    setSavedDecks(next);
    localStorage.setItem('saved_decks', JSON.stringify(next));
    playClick();
  };

  return (
    <main
      className="main-board"
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundImage: "url('/images/bg-pattern.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      {/* メニューボタン */}
      <button
        onClick={() => { playClick(); setMenuOpen(o => !o); }}
        style={{
          position: 'absolute',
          top:'7%',
          right: '5%',
          width: 32,
          height: 32,
          borderRadius: 4,
          fontSize: 24,
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        ☰
      </button>

      <Menu
        menuOpen={menuOpen}
        menuMode="home"
        onToggle={() => { playClick(); setMenuOpen(o => !o); }}
        draftHref="/draft"
        gameHref="https://unityroom.com/games/anokorotcg"
      />

      {/* ヒーロー */}
      <h1
        style={{
          fontFamily: 'ChalkFont, sans-serif',
          fontSize: '3rem',
          color: '#fff',
          textShadow: '2px 2px 0 #000',
          marginBottom: '1rem',
        }}
      >
        あの頃の自作TCG<br/>アリーナへようこそ！
      </h1>
      <p
        style={{
          fontFamily: 'ChalkFont, sans-serif',
          fontSize: '1.25rem',
          color: '#fff',
          margin: '1rem 0 3rem',
        }}
      >
        あの頃の自作TCGで<br/>
        アリーナの体験を再現！
      </p>

      {/* アクションボタン */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '4rem',
        }}
      >
        <Link href="/draft" onClick={playClick}>
          <button
            className="btn"
            style={{ fontSize: '1.25rem' }}
          >
            ドラフトピックを始める
          </button>
        </Link>
        <a
          href="https://unityroom.com/games/anokorotcg"
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
        >
          <button
            className="btn"
            style={{ fontSize: '1.25rem' }}
          >
            ゲームを遊ぶ →
          </button>
        </a>
      </div>

      {/* 遊び方サマリー */}
      <section
        style={{
          marginTop: '4rem',
          color: '#fff',
        }}
      >
        <h2
          style={{
            fontFamily: 'ChalkFont, sans-serif',
            fontSize: '2rem',
            marginBottom: '1rem',
          }}
        >
          遊び方３ステップ
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            marginTop: '2rem',
          }}
        >
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
      <section
        style={{
          color: '#fff',
          textAlign: 'left',
          maxWidth: '100%',
          marginLeft: '3rem',
          marginRight: 'auto',
          marginTop: '-10rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'ChalkFont, sans-serif',
            fontSize: '2rem',
            marginBottom: '1rem',
          }}
        >
          保存済みデッキ一覧
        </h2>
        {savedDecks.length === 0 ? (
          <p>まだ保存されたデッキがありません。</p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              marginTop: '1rem',
              maxHeight: '200px',
              overflowY: 'auto',
              paddingRight: '1rem',
            }}
          >
            {savedDecks.map(deck => (
              <li
                key={deck.id}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '1rem',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '200px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {deck.name}
                </span>
                <span
                  style={{
                    margin: '0 1rem',
                    fontSize: '0.9rem',
                    color: '#ddd',
                  }}
                >
                  ({new Date(deck.savedAt).toLocaleString('ja-JP')})
                </span>
                <div style={{ marginLeft: 'auto' }}>
                  <Link href={`/draft?load=${deck.id}`} onClick={playClick}>
                    <button
                      className="btn"
                      style={{ marginLeft: '1rem' }}
                    >
                      読み込む
                    </button>
                  </Link>
                  <button
                    className="btn btn-reset"
                    onClick={() => deleteDeck(deck.id)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
