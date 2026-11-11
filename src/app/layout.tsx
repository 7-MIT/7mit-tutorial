import './tokens.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Shell } from '@/components/Shell';

export const metadata: Metadata = {
  metadataBase: new URL('https://tutorial.7mit.org'),
  title: { default: 'tutorial.7mit — Pusat Bantuan 7 MIT', template: '%s · tutorial.7mit' },
  description: 'Pusat bantuan interaktif untuk semua layanan digital 7 MIT: panduan, simulasi, dan asisten AI lokal.',
  openGraph: { title: 'tutorial.7mit', description: 'Pusat Bantuan interaktif 7 MIT', url: 'https://tutorial.7mit.org', siteName: 'tutorial.7mit', type: 'website', images: ['/assets/logo-7mit.jpg'] },
  icons: { icon: '/assets/logo-7mit.jpg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@500;600;700&display=swap" />
      </head>
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
