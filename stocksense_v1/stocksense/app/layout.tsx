import type { Metadata, Viewport } from 'next';
import { Sarabun, Space_Mono } from 'next/font/google';
import './globals.css';

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'StockSense — สัมผัสตลาด ก่อนที่ตลาดจะบอก',
    template: '%s · StockSense',
  },
  description:
    'AI Stock Scanner สแกนหุ้นไทย+ต่างประเทศ Realtime · บอกซื้อ/หนีใน 1 วินาที · Whale Tracker · Smart Money Flow · Win Rate%',
  keywords: [
    'สแกนหุ้น', 'หุ้นไทย', 'AI หุ้น', 'whale tracker', 'smart money',
    'stock scanner', 'SET', 'NASDAQ', 'หุ้นเด่น', 'StockSense',
  ],
  authors: [{ name: 'StockSense Team' }],
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://stocksense.app',
    title: 'StockSense — สัมผัสตลาด ก่อนที่ตลาดจะบอก',
    description: 'AI บอกซื้อ/หนีในวินาทีเดียว · Whale Tracker Realtime',
    siteName: 'StockSense',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'StockSense' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockSense — สัมผัสตลาด ก่อนที่ตลาดจะบอก',
    description: 'AI Stock Scanner · ดู Whale Activity Realtime',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#060A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
