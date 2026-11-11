import './tokens.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'tutorial.7mit — Pusat Bantuan 7 MIT', description: 'Pusat bantuan interaktif untuk layanan digital 7 MIT.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="id"><body style={{ background: 'var(--surface, #fbf6ee)', color: 'var(--ink, #2a1a1a)', fontFamily: 'system-ui, sans-serif' }}>{children}</body></html>);
}
