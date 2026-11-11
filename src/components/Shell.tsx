'use client';
import Link from 'next/link';
import { Bot, Languages, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AppProvider, useApp } from '@/lib/i18n';
import { SearchPalette } from './Search';

function Header() {
  const { t, lang, setLang, theme, toggleTheme, setOpenSearch } = useApp();
  const [open, setOpen] = useState(false);
  const nav: [string, string][] = [['/help/', t('help')], ['/services/', t('services')], ['/troubleshooting/', t('trouble')], ['/ai/', t('ai')]];
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-line" style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}>
      <div className="mx-auto max-w-6xl flex items-center gap-1 sm:gap-3 px-3 sm:px-4 h-16">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-brand shrink-0"><img src="/assets/logo-7mit.jpg" alt="7 MIT" height={28} className="h-7 w-auto rounded-sm" /><span className="hidden min-[430px]:inline">tutorial<span className="text-ink">.7mit</span></span></Link>
        <nav aria-label="Utama" className="hidden md:flex gap-1 ml-4">{nav.map(([h, l]) => <Link key={h} href={h} className="px-3 py-2 rounded-full text-sm text-muted hover:text-ink hover:bg-sunken">{l}</Link>)}</nav>
        <div className="flex-1" />
        <button type="button" onClick={() => setOpenSearch(true)} className="flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-2 text-sm text-muted hover:text-ink" aria-label={t('search')}><Search size={16} aria-hidden /><span className="hidden sm:inline">{t('search')}</span><kbd className="hidden lg:inline text-xs border border-line rounded px-1">Ctrl K</kbd></button>
        <button type="button" onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="p-2 rounded-full hover:bg-sunken flex items-center gap-1 text-sm" aria-label={t('lang')}><Languages size={18} aria-hidden />{lang.toUpperCase()}</button>
        <button type="button" onClick={toggleTheme} className="p-2 rounded-full hover:bg-sunken" aria-label={t('theme')}>{theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}</button>
        <button type="button" onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-full hover:bg-sunken" aria-expanded={open} aria-label="Menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && <nav className="md:hidden border-t border-line px-4 py-2 grid" aria-label="Seluler">{nav.map(([h, l]) => <Link key={h} href={h} onClick={() => setOpen(false)} className="py-3 text-ink">{l}</Link>)}</nav>}
    </header>
  );
}
function Footer() {
  const { t } = useApp();
  return (
    <footer className="mt-20 border-t border-line bg-sunken">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3 text-sm text-muted">
        <div><p className="font-display text-lg text-ink">tutorial.7mit</p><p className="mt-1">Pusat Bantuan 7 MIT — Kharisma Bangsa.</p></div>
        <div className="grid gap-1"><Link href="/help/">{t('help')}</Link><Link href="/services/">{t('services')}</Link><Link href="/ai/" className="inline-flex items-center gap-1"><Bot size={14} aria-hidden />{t('ai')}</Link><a href="https://status.7mit.org" rel="noopener">{t('status')}</a></div>
        <div><p>{t('contact')}: <a className="underline" href="mailto:halo@7mit.org">halo@7mit.org</a></p><p className="mt-2"><Link href="/admin/" className="hover:text-ink">Admin</Link></p></div>
      </div>
    </footer>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-brand text-on-brand rounded px-3 py-2">Skip to content</a>
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 min-h-[60vh]">{children}</main>
      <Footer />
      <SearchPalette />
    </AppProvider>
  );
}
