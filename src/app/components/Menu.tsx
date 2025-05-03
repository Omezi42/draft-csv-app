// src/app/components/Menu.tsx
'use client';

import Link from 'next/link';
import React from 'react';
import { useAudio } from '../context/AudioContext';
import { useRouter } from 'next/navigation';

type MenuProps = {
  menuOpen: boolean;
  menuMode: 'home' | 'draft' | 'deck';
  onToggle: () => void;
  // ドラフト用
  showDeckList?: boolean;
  hasPickedAll?: boolean;
  handleReset?: () => void;
  setIsReadyForDeckList?: (b: boolean) => void;
  copyDeckImageToClipboard?: () => void;
  downloadDeckImage?: () => void;
  onSaveDeck?: () => void;
  // 汎用
  draftHref?: string;
  gameHref?: string;
};

export function Menu({
  menuOpen,
  menuMode,
  onToggle,
  showDeckList = false,
  hasPickedAll = false,
  handleReset = () => {},
  setIsReadyForDeckList = () => {},
  copyDeckImageToClipboard = () => {},
  downloadDeckImage = () => {},
  onSaveDeck = () => {},
  draftHref = '/draft',
  gameHref = '/game',
}: MenuProps) {
  const router = useRouter();
  const { volume, setVolume } = useAudio();

  const click = new Audio('/se/click.mp3');
  const playClick = () => {
    click.currentTime = 0;
    click.volume = volume;
    click.play().catch(() => {});
  };

  if (!menuOpen) return null;

  return (
    <div
      className="menu-dropdown"
      data-ignore-export
      style={{
        position: 'absolute',
        top: '13%',
        right: '5%',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        padding: 8,
        zIndex: 1000,
        maxWidth: '17rem',
      }}
    >
      <label style={{ display: 'block', marginBottom: '0.5rem' }} data-ignore-export>
        🔊 音量
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          onMouseUp={playClick} // ← 連続再生防止のため、onChangeではなく onMouseUp
          style={{ width: '100%' }}
        />
      </label>

      {menuMode === 'home' && (
        <>
          <button
            className="btn"
            onClick={() => {
              playClick();
              router.push(draftHref);
              onToggle();
            }}
            style={{ marginBottom: 8, width: '100%' }}
          >
            ドラフトピックを始める
          </button>
          <button
            className="btn"
            onClick={() => {
              playClick();
              router.push(gameHref);
              onToggle();
            }}
            style={{ width: '100%' }}
          >
            ゲームを遊ぶ →
          </button>
        </>
      )}

      {menuMode === 'draft' && (
        <>
          <button
            className="btn btn-reset"
            onClick={() => {
              handleReset();
              playClick();
            }}
            style={{ marginBottom: 8, width: '100%' }}
          >
            ドラフトリセット
          </button>
          <button
            className="btn"
            onClick={() => {
              playClick();
              router.push('/');
            }}
            style={{ marginBottom: 8, width: '100%' }}
          >
            トップへ戻る
          </button>
          <button
            className="btn"
            disabled={!hasPickedAll}
            onClick={() => {
              setIsReadyForDeckList(true);
              playClick();
            }}
            style={{
              marginBottom: 8,
              width: '100%',
              opacity: hasPickedAll ? 1 : 0.5,
              cursor: hasPickedAll ? 'pointer' : 'not-allowed',
            }}
          >
            デッキ一覧を表示する
          </button>
        </>
      )}

      {menuMode === 'deck' && (
        <>
          <button
            className="btn"
            onClick={() => {
              playClick();
              copyDeckImageToClipboard();
            }}
            style={{ marginBottom: 8, width: '100%' }}
          >
            📋 デッキ画像をコピー
          </button>
          <button
            className="btn"
            onClick={() => {
              playClick();
              downloadDeckImage();
            }}
            style={{ marginBottom: 8, width: '100%' }}
          >
            💾 ダウンロード
          </button>
          <button
            className="btn"
            onClick={() => {
              playClick();
              onSaveDeck();
            }}
            style={{ marginBottom: 8, width: '100%' }}
          >
            💾 デッキ保存
          </button>
          <button
    className="btn"
    onClick={() => {
      playClick();
      setIsReadyForDeckList(false); // ドラフト画面に戻る
    }}
    style={{ marginBottom: 8, width: '100%' }}
  >
    ドラフトへ戻る
  </button>
          <button
            className="btn"
            onClick={() => {
              playClick();
              router.push('/');
            }}
            style={{ width: '100%' }}
          >
            トップへ戻る
          </button>
        </>
      )}
    </div>
  );
}
