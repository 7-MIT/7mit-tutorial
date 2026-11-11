'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useApp } from '@/lib/i18n';
import { HitRow, useSearch } from '@/components/Search';
import { PageTitle } from '@/components/Cards';
import { addRecent, getRecent, runSearch } from '@/lib/search';

function Inner() {
  const { t, tr, bundle } = useApp();
  const ms = useSearch();
  const router = useRouter();
  const sp = useSearchParams();
  const q0 = sp.get('q') ?? '';
  const [q, setQ] = useState(q0);
  const [cat, setCat] = useState(''); const [kind, setKind] = useState(''); const [svc, setSvc] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { setQ(q0); setRecent(getRecent()); }, [q0]);
  const hits = useMemo(() => runSearch(ms, q, { category: cat, kind, service: svc }), [ms, q, cat, kind, svc]);
  const terms = useMemo(() => q.split(/\s+/).filter(Boolean), [q]);
  const sel = 'rounded-md border border-line bg-raised px-3 py-2 text-sm';
  return (<>
    <PageTitle title={t('search')} />
    <form role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { addRecent(q.trim()); router.replace(`/search/?q=${encodeURIComponent(q.trim())}`); } }} className="flex items-center gap-2 rounded-full border border-line bg-raised px-4 mb-4"><Search size={18} className="text-muted" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPh')} aria-label={t('search')} className="flex-1 bg-transparent py-3 outline-none" /></form>
    <div className="flex flex-wrap gap-2 mb-4">
      <select aria-label={t('categories')} className={sel} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">{t('categories')}: {t('all')}</option>{bundle.categories.map((c) => <option key={c.slug} value={c.slug}>{tr(c.name)}</option>)}</select>
      <select aria-label={t('services')} className={sel} value={svc} onChange={(e) => setSvc(e.target.value)}><option value="">{t('services')}: {t('all')}</option>{bundle.services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
      <select aria-label="Tipe" className={sel} value={kind} onChange={(e) => setKind(e.target.value)}><option value="">{t('all')}</option><option value="article">{t('help')}</option><option value="service">{t('services')}</option></select>
    </div>
    {!q.trim() && recent.length > 0 && <div className="mb-4"><p className="text-sm text-muted mb-1">{t('recent')}</p><div className="flex flex-wrap gap-2">{recent.map((r) => <button key={r} type="button" onClick={() => setQ(r)} className="rounded-full bg-sunken px-3 py-1 text-sm">{r}</button>)}</div></div>}
    <div role="status" aria-live="polite">{q.trim() && !hits.length && <p className="text-muted">{t('noResults')}</p>}</div>
    <div className="grid gap-1">{hits.map((h) => <HitRow key={h.id} h={h} terms={terms} />)}</div>
  </>);
}
export default function SearchPage() { return <Suspense fallback={null}><Inner /></Suspense>; }
