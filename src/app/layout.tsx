import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "あの頃の自作TCG アリーナ",
  description: "あの頃の自作TCGのカードでドラフトができます！",
  openGraph: {
    title: "あの頃の自作TCG アリーナ",
    description: "あの頃の自作TCGでアリーナを再現！ドラフトでデッキを作成してライバルと戦おう。",
    url: "https://anokorotcg-arena.vercel.app",
    siteName: "あの頃の自作TCG アリーナ",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "あの頃の自作TCG アリーナ OG Image",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "あの頃の自作TCG アリーナ",
    description: "あの頃の自作TCGのオンラインドラフトページへようこそ！",
    images: ["/images/twitter-card.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#553a21]`}
      >
        {children}
      </body>
    </html>
  );
}
