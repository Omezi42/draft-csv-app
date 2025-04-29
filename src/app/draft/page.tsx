// app/draft/page.tsx (サーバーコンポーネント)
import { Suspense } from 'react';
import DraftClient from './DraftClient';

export default function Page() {
  return (
    <Suspense fallback={<div>読み込み中…</div>}>
      <DraftClient />
    </Suspense>
  );
}
