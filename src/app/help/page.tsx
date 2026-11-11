'use client';
import { useState } from 'react';
import { useApp } from '@/lib/i18n';
import { ArticleCard, PageTitle } from '@/components/Cards';

export default function HelpIndex() {
  const { t, tr, bundle } = useApp();
  const [cat, setCat] = useState('');
  const list = bundle.articles.filter((a) => a.status === 'published' && (!cat || a.category === cat));
  return (
    <>
      <PageTitle title={t('help')} sub={t('heroSub')} />
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={t('categories')}>
        {[{ slug: '', name: { id: t('all') } }, ...bundle.categories].map((c) => <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)} className={`rounded-full px-4 py-1.5 text-sm border ${cat === c.slug ? 'bg-brand text-on-brand border-brand' : 'border-line hover:bg-sunken'}`}>{tr(c.name)}</button>)}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{list.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
    </>
  );
}
