// app/layout.tsx
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { AudioProvider } from './context/AudioContext';
import AudioPlayer from './components/AudioPlayer';
import GlobalBgmPlayer from './components/GlobalBgmPlayer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AudioProvider>
          <GlobalBgmPlayer />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
