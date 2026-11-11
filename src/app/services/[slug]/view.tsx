'use client';
import Link from 'next/link';
import { ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/i18n';
import { useSlug } from '@/lib/slug';
import { ArticleCard, Icon, PageTitle, StatusBadge } from '@/components/Cards';

export default function View({ param }: { param: string }) {
  const { t, tr, bundle } = useApp();
  const slug = useSlug(param, 'services');
  const s = bundle.services.find((x) => x.slug === slug);
  if (!s) return <PageTitle title={slug ? t('notFound') : t('loading')} />;
  const arts = bundle.articles.filter((a) => a.services.includes(slug));
  return (<>
    <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4"><Link href="/services/">{t('services')}</Link> / <span className="text-ink">{s.name}</span></nav>
    <div className="flex flex-wrap items-start gap-4 mb-6"><span className="grid size-14 place-items-center rounded-lg bg-brand-soft text-brand-ink"><Icon name={s.icon} size={28} /></span>
      <div className="flex-1 min-w-[16rem]"><h1 className="font-display text-3xl flex flex-wrap items-center gap-3">{s.name}<StatusBadge status={s.status} /></h1><p className="text-muted mt-1">{tr(s.summary)}</p></div>
      {s.status !== 'planned' && <a href={s.url} rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-brand text-on-brand px-5 py-2.5 hover:bg-brand-hover">{t('visit')}<ExternalLink size={16} aria-hidden /></a>}</div>
    <p className={`rounded-md p-4 flex gap-3 text-sm ${s.verified ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>{s.verified ? <ShieldCheck size={18} aria-hidden className="shrink-0" /> : <ShieldAlert size={18} aria-hidden className="shrink-0" />}<span><b>{s.verified ? t('verified') : t('unverified')}.</b> {s.verifiedNote}</span></p>
    <h2 className="font-display text-2xl mt-10 mb-4">{t('help')}</h2>
    {arts.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{arts.map((a) => <ArticleCard key={a.slug} a={a} />)}</div> : <p className="text-muted">—</p>}
  </>);
}
