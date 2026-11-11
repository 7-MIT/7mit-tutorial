'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Clock, Share2, ThumbsDown, ThumbsUp, TriangleAlert } from 'lucide-react';
import { API, ANON } from '@/lib/content';
import { useApp } from '@/lib/i18n';
import { useSlug } from '@/lib/slug';
import { Blocks, headingId } from '@/components/Blocks';
import { ArticleCard, PageTitle, StatusBadge } from '@/components/Cards';

function Feedback({ slug }: { slug: string }) {
  const { t, lang } = useApp();
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  async function send(h: boolean, c = '') {
    setState('sending');
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', apikey: ANON, authorization: `Bearer ${ANON}` }, body: JSON.stringify({ action: 'feedback', slug, helpful: h, comment: c, lang }) });
      const j = await r.json(); setState(j.ok ? 'done' : 'error');
    } catch { setState('error'); }
  }
  if (state === 'done') return <p role="status" className="flex items-center gap-2 text-success"><Check size={18} aria-hidden />{t('thanks')}</p>;
  return (
    <div className="rounded-lg border border-line bg-raised p-5">
      <p className="font-medium">{t('helpful')}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={state === 'sending'} onClick={() => { setHelpful(true); void send(true); }} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 hover:bg-sunken"><ThumbsUp size={16} aria-hidden />{t('yes')}</button>
        <button type="button" onClick={() => setHelpful(false)} aria-pressed={helpful === false} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 hover:bg-sunken"><ThumbsDown size={16} aria-hidden />{t('no')}</button>
      </div>
      {helpful === false && <div className="mt-3 grid gap-2"><label className="text-sm text-muted" htmlFor="fbc">{lang === 'en' ? 'What was missing? (optional)' : 'Apa yang kurang? (opsional)'}</label>
        <textarea id="fbc" maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} className="rounded-md border border-line bg-surface p-2" rows={3} />
        <button type="button" disabled={state === 'sending'} onClick={() => send(false, comment)} className="justify-self-start rounded-full bg-brand text-on-brand px-4 py-2 text-sm">{lang === 'en' ? 'Send' : 'Kirim'}</button></div>}
      {state === 'error' && <p role="alert" className="mt-2 text-sm text-danger flex items-center gap-1"><TriangleAlert size={14} aria-hidden />{lang === 'en' ? 'Could not send. Try again later.' : 'Gagal mengirim. Coba lagi nanti.'}</p>}
    </div>
  );
}

export default function View({ param }: { param: string }) {
  const { t, tr, bundle, lang } = useApp();
  const slug = useSlug(param, 'article');
  const a = bundle.articles.find((x) => x.slug === slug);
  const [copied, setCopied] = useState(false);
  const toc = useMemo(() => (a ? a.blocks.flatMap((b) => (b.kind === 'heading' ? [{ id: headingId(tr(b.text)), label: tr(b.text) }] : [])) : []), [a, tr]);
  useEffect(() => { if (a) document.title = `${tr(a.title)} · tutorial.7mit`; }, [a, tr]);
  if (!a) return <PageTitle title={slug ? t('notFound') : t('loading')} />;
  const cat = bundle.categories.find((c) => c.slug === a.category);
  const svc = bundle.services.find((s) => s.slug === a.service);
  const same = bundle.articles.filter((x) => x.category === a.category);
  const idx = same.findIndex((x) => x.slug === a.slug);
  const prev = idx > 0 ? same[idx - 1] : null, next = idx >= 0 && idx < same.length - 1 ? same[idx + 1] : null;
  const related = bundle.articles.filter((x) => x.slug !== a.slug && (x.service === a.service || x.category === a.category)).slice(0, 3);
  const share = async () => {
    const url = location.href;
    try { if (navigator.share) await navigator.share({ title: tr(a.title), url }); else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } } catch { /* dibatalkan */ }
  };
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: tr(a.title), description: tr(a.summary), dateModified: a.updatedAt, inLanguage: lang };
  return (
    <div className="grid lg:grid-cols-[1fr_16rem] gap-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4 flex flex-wrap gap-1"><Link href="/help/">{t('help')}</Link>/{cat && <><Link href={`/help/category/${cat.slug}/`}>{tr(cat.name)}</Link>/</>}<span className="text-ink">{tr(a.title)}</span></nav>
        <h1 className="font-display text-3xl md:text-4xl">{tr(a.title)}</h1>
        <p className="mt-2 text-lg text-muted">{tr(a.summary)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          {svc && <Link href={`/services/${svc.slug}/`} className="inline-flex items-center gap-2 hover:text-ink">{svc.name}<StatusBadge status={svc.status} /></Link>}
          <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden />{a.minutes} {t('min')}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${a.verified ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>{a.verified ? t('verified') : t('unverified')}</span>
          <button type="button" onClick={share} className="inline-flex items-center gap-1 hover:text-ink"><Share2 size={14} aria-hidden />{copied ? t('copied') : t('share')}</button>
        </div>
        <div className="mt-8"><Blocks blocks={a.blocks} /></div>
        <div className="mt-12"><Feedback slug={a.slug} /></div>
        <div className="mt-8 flex justify-between gap-4 text-sm">
          {prev ? <Link href={`/help/article/${prev.slug}/`} className="inline-flex items-center gap-2 text-brand"><ArrowLeft size={16} aria-hidden />{tr(prev.title)}</Link> : <span />}
          {next && <Link href={`/help/article/${next.slug}/`} className="inline-flex items-center gap-2 text-brand text-right">{tr(next.title)}<ArrowRight size={16} aria-hidden /></Link>}
        </div>
        {related.length > 0 && <section className="mt-12"><h2 className="font-display text-xl mb-3">{t('related')}</h2><div className="grid sm:grid-cols-3 gap-3">{related.map((r) => <ArticleCard key={r.slug} a={r} />)}</div></section>}
      </article>
      {toc.length > 0 && <aside className="hidden lg:block"><nav aria-label={t('onThisPage')} className="sticky top-24 text-sm"><p className="font-semibold mb-2">{t('onThisPage')}</p><ul className="grid gap-1 border-l border-line">{toc.map((h) => <li key={h.id}><a href={`#${h.id}`} className="block pl-3 py-1 text-muted hover:text-ink">{h.label}</a></li>)}</ul></nav></aside>}
    </div>
  );
}
