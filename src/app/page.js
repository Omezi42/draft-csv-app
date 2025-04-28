// app/page.tsx  または  pages/index.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="main-board" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      {/* ヒーロー */}
      <h1 style={{
        fontFamily: 'ChalkFont, sans-serif',
        fontSize: '3rem',
        color: '#fff',
        textShadow: '2px 2px 0 #000',
      }}>
        あの頃の自作TCG アリーナへようこそ！
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
        <a href="https://unityroom.com/games/あなたのゲームID" target="_blank" rel="noopener">
          <button className="btn" style={{ fontSize: '1.25rem' }}>
            自作TCGを遊ぶ →
          </button>
        </a>
      </div>

      {/* 遊び方サマリー（任意） */}
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
    </main>
  );
}
