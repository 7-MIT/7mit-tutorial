'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, History, Search as SearchIcon, Server } from 'lucide-react';
import { useApp } from '@/lib/i18n';
import { addRecent, buildIndex, getRecent, highlight, runSearch, snippet, type Hit } from '@/lib/search';

export function useSearch() {
  const { bundle, lang } = useApp();
  return useMemo(() => buildIndex(bundle, lang), [bundle, lang]);
}
export function Marked({ text, terms }: { text: string; terms: string[] }) {
  return <>{highlight(text, terms).map((p, i) => p.m ? <mark key={i} className="bg-blush text-[#2a0a10] rounded px-0.5">{p.t}</mark> : <span key={i}>{p.t}</span>)}</>;
}
export function HitRow({ h, terms, onGo }: { h: Hit; terms: string[]; onGo?: () => void }) {
  const href = h.kind === 'article' ? `/help/article/${h.slug}/` : `/services/${h.slug}/`;
  const Icon = h.kind === 'article' ? FileText : Server;
  return (
    <Link href={href} onClick={onGo} className="flex gap-3 rounded-md p-3 hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-2 focus-visible:outline-focus">
      <Icon size={18} className="text-brand-ink shrink-0 mt-1" aria-hidden />
      <span className="min-w-0"><span className="block font-medium text-ink"><Marked text={h.title} terms={terms} /></span><span className="block text-sm text-muted line-clamp-2"><Marked text={snippet(h.summary + ' ' + (h.text || ''), terms)} terms={terms} /></span></span>
    </Link>
  );
}

export function SearchPalette() {
  const { openSearch, setOpenSearch, t, tr } = useApp();
  const ms = useSearch();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hits = useMemo(() => runSearch(ms, q).slice(0, 8), [ms, q]);
  const terms = useMemo(() => q.split(/\s+/).filter(Boolean), [q]);
  useEffect(() => { if (openSearch) { setRecent(getRecent()); setTimeout(() => ref.current?.focus(), 30); } else setQ(''); }, [openSearch]);
  useEffect(() => { if (!openSearch) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenSearch(false); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [openSearch, setOpenSearch]);
  if (!openSearch) return null;
  const go = () => { if (q.trim()) { addRecent(q.trim()); router.push(`/search/?q=${encodeURIComponent(q.trim())}`); setOpenSearch(false); } };
  void tr;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-start justify-items-center pt-[10vh] px-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpenSearch(false); }} role="dialog" aria-modal="true" aria-label={t('search')}>
      <div className="w-full max-w-xl rounded-xl bg-raised border border-line shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-line"><SearchIcon size={18} className="text-muted" aria-hidden />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') go(); }} placeholder={t('searchPh')} className="flex-1 bg-transparent py-4 outline-none text-ink placeholder:text-muted" aria-label={t('search')} /></div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim() === '' ? (recent.length ? <><p className="px-3 py-1 text-xs uppercase text-muted">{t('recent')}</p>{recent.map((r) => <button key={r} type="button" onClick={() => setQ(r)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-sunken"><History size={16} className="text-muted" aria-hidden />{r}</button>)}</> : null)
            : hits.length ? hits.map((h) => <HitRow key={h.id} h={h} terms={terms} onGo={() => { addRecent(q.trim()); setOpenSearch(false); }} />) : <p className="p-4 text-muted">{t('noResults')}</p>}
        </div>
        <p className="px-4 py-2 text-xs text-muted border-t border-line">Enter: {t('search')} · Esc</p>
      </div>
    </div>
  );
}
