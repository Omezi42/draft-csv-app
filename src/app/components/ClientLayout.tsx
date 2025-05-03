'use client';

import { ReactNode } from 'react';
import { AudioProvider } from '../context/AudioContext';
import GlobalBgmPlayer from './GlobalBgmPlayer';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      <GlobalBgmPlayer />
      {children}
    </AudioProvider>
  );
}
