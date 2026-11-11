'use client';
import Link from 'next/link';
import { useApp } from '@/lib/i18n';
import { useSlug } from '@/lib/slug';
import { ArticleCard, PageTitle } from '@/components/Cards';

export default function View({ param }: { param: string }) {
  const { t, tr, bundle } = useApp();
  const slug = useSlug(param, 'category');
  const c = bundle.categories.find((x) => x.slug === slug);
  if (!c) return <PageTitle title={slug ? t('notFound') : t('loading')} />;
  const list = bundle.articles.filter((a) => a.category === slug && a.status === 'published');
  return (<>
    <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4"><Link href="/help/">{t('help')}</Link> / <Link href="/help/categories/">{t('categories')}</Link> / <span className="text-ink">{tr(c.name)}</span></nav>
    <PageTitle title={tr(c.name)} sub={tr(c.description)} />
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{list.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
  </>);
}
