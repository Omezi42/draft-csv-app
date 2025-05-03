'use client';

import { ReactNode } from 'react';
import { AudioProvider } from '../context/AudioContext';
import GlobalBgmPlayer from './GlobalBgmPlayer';

type Props = {
  children: ReactNode;
};

export default function ClientLayout({ children }: Props) {
  return (
    <AudioProvider>
      <GlobalBgmPlayer />
      {children}
    </AudioProvider>
  );
}
