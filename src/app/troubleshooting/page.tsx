'use client';
import Link from 'next/link';
import { useApp } from '@/lib/i18n';
import { Blocks } from '@/components/Blocks';
import { PageTitle } from '@/components/Cards';

export default function Troubleshooting() {
  const { t, tr, bundle } = useApp();
  const items = bundle.articles.filter((a) => a.blocks.some((b) => b.kind === 'troubleshoot'));
  return (<>
    <PageTitle title={t('trouble')} sub={tr({ id: 'Jawab beberapa pertanyaan singkat untuk menemukan penyebab dan solusinya.', en: 'Answer a few short questions to find the cause and the fix.' })} />
    <div className="grid gap-10">{items.map((a) => (
      <section key={a.slug} aria-labelledby={`t-${a.slug}`}>
        <h2 id={`t-${a.slug}`} className="font-display text-xl mb-3"><Link href={`/help/article/${a.slug}/`} className="hover:text-brand">{tr(a.title)}</Link></h2>
        <Blocks blocks={a.blocks.filter((b) => b.kind === 'troubleshoot')} />
      </section>))}</div>
  </>);
}
