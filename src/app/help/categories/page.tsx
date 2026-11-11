'use client';
import Link from 'next/link';
import { useApp } from '@/lib/i18n';
import { Icon, PageTitle } from '@/components/Cards';

export default function Categories() {
  const { t, tr, bundle } = useApp();
  return (
    <>
      <PageTitle title={t('categories')} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{bundle.categories.map((c) => {
        const n = bundle.articles.filter((a) => a.category === c.slug && a.status === 'published').length;
        return <Link key={c.slug} href={`/help/category/${c.slug}/`} className="rounded-lg border border-line bg-raised p-5 shadow-card hover:border-brand"><span className="grid size-11 place-items-center rounded-md bg-brand-soft text-brand-ink"><Icon name={c.icon} /></span><h2 className="font-display text-xl mt-3">{tr(c.name)}</h2><p className="text-sm text-muted mt-1">{tr(c.description)}</p><p className="text-xs text-muted mt-3">{n} {t('articles')}</p></Link>;
      })}</div>
    </>
  );
}
