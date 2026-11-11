import type { Metadata } from 'next';
import { bundle0, tr } from '@/lib/content';
import View from './view';
export function generateStaticParams() { return [...bundle0.articles.map((a) => ({ slug: a.slug })), { slug: '__fallback' }]; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = bundle0.articles.find((x) => x.slug === slug);
  if (!a) return { title: 'Artikel' };
  return { title: tr(a.title, 'id'), description: tr(a.summary, 'id'), alternates: { canonical: `/help/article/${slug}/` }, openGraph: { title: tr(a.title, 'id'), description: tr(a.summary, 'id'), type: 'article', url: `/help/article/${slug}/` } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <View param={slug} />; }
