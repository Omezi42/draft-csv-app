// src/types.ts
export type Card = {
  id: string
  name: string
  cost: string
  power: string
  types: string
  text: string
  cardType: string
}
export type SavedDeck = {
  id: string;       // ユニーク ID（UUID）
  name: string;     // ユーザーが付けたデッキ名
  cards: Card[];    // カード配列
  savedAt: number;  // 保存日時のタイムスタンプ
};