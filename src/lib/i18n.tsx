'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API, bundle0, tr as trx, type Bundle } from './content';
import type { Bi } from './schemas';

type Lang = 'id' | 'en';
type Theme = 'light' | 'dark';
const UI = {
  home: ['Beranda', 'Home'], help: ['Bantuan', 'Help'], services: ['Layanan', 'Services'], search: ['Cari', 'Search'], ai: ['Asisten AI', 'AI assistant'], trouble: ['Pemecahan masalah', 'Troubleshooting'],
  categories: ['Kategori', 'Categories'], all: ['Semua', 'All'], popular: ['Populer', 'Popular'], featured: ['Pilihan', 'Featured'], newest: ['Terbaru', 'Newest'], min: ['mnt baca', 'min read'],
  searchPh: ['Cari bantuan, layanan, atau masalah…', 'Search help, services, or problems…'], helpful: ['Apakah artikel ini membantu?', 'Was this article helpful?'], yes: ['Ya', 'Yes'], no: ['Tidak', 'No'],
  thanks: ['Terima kasih atas masukan Anda.', 'Thanks for your feedback.'], share: ['Bagikan', 'Share'], copied: ['Tautan disalin', 'Link copied'], onThisPage: ['Di halaman ini', 'On this page'],
  draft: ['Draf', 'Draft'], unverified: ['Belum terverifikasi', 'Not verified'], verified: ['Terverifikasi', 'Verified'], visit: ['Buka layanan', 'Open service'], related: ['Terkait', 'Related'],
  heroTitle: ['Bantuan 7 MIT, langsung dipraktikkan', 'Help for 7 MIT, learn by doing'], heroSub: ['Panduan interaktif, simulasi, dan asisten AI lokal untuk semua layanan digital 7 MIT.', 'Interactive guides, simulations, and a local AI assistant for every 7 MIT digital service.'],
  noResults: ['Tidak ada hasil. Coba kata lain.', 'No results. Try other words.'], recent: ['Pencarian terakhir', 'Recent searches'], theme: ['Ganti tema', 'Toggle theme'], lang: ['Bahasa', 'Language'],
  skip: ['Lewati ke konten', 'Skip to content'], demo: ['Demo', 'Demo'], next: ['Berikutnya', 'Next'], prev: ['Sebelumnya', 'Previous'], restart: ['Ulangi', 'Restart'], check: ['Periksa', 'Check'], correct: ['Benar', 'Correct'], wrong: ['Kurang tepat', 'Not quite'],
  back: ['Kembali', 'Back'], notFound: ['Halaman tidak ditemukan', 'Page not found'], loading: ['Memuat…', 'Loading…'], articles: ['artikel', 'articles'], status: ['Status', 'Status'], contact: ['Hubungi kami', 'Contact us'],
} as const;
export type UiKey = keyof typeof UI;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; theme: Theme; toggleTheme: () => void; t: (k: UiKey) => string; tr: (v?: Bi) => string; bundle: Bundle; openSearch: boolean; setOpenSearch: (v: boolean) => void };
const C = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(C); if (!c) throw new Error('AppProvider hilang'); return c; };

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id');
  const [theme, setTheme] = useState<Theme>('light');
  const [bundle, setBundle] = useState<Bundle>(bundle0);
  const [openSearch, setOpenSearch] = useState(false);
  useEffect(() => {
    try {
      const l = localStorage.getItem('t7-lang') as Lang | null; if (l === 'id' || l === 'en') setLangState(l); else if (navigator.language.startsWith('en')) setLangState('en');
      const th = localStorage.getItem('t7-theme') as Theme | null; setTheme(th === 'dark' || th === 'light' ? th : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch { /* penyimpanan tidak tersedia */ }
    const ctl = new AbortController();
    fetch(API, { signal: ctl.signal }).then((r) => r.json()).then((j) => { if (j?.ok && j.articles?.length) setBundle(j as Bundle); }).catch(() => { /* tetap pakai snapshot */ });
    return () => ctl.abort();
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.lang = lang; }, [theme, lang]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpenSearch((v) => !v); } };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, []);
  const setLang = useCallback((l: Lang) => { setLangState(l); try { localStorage.setItem('t7-lang', l); } catch { /* abaikan */ } }, []);
  const toggleTheme = useCallback(() => setTheme((v) => { const n = v === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('t7-theme', n); } catch { /* abaikan */ } return n; }), []);
  const value = useMemo<Ctx>(() => ({ lang, setLang, theme, toggleTheme, t: (k) => UI[k][lang === 'en' ? 1 : 0], tr: (v) => trx(v, lang), bundle, openSearch, setOpenSearch }), [lang, setLang, theme, toggleTheme, bundle, openSearch]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
