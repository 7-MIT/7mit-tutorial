import { bundle0 } from '@/lib/content';
import View from './view';
export function generateStaticParams() { return [...bundle0.services.map((s) => ({ slug: s.slug })), { slug: '__fallback' }]; }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <View param={slug} />; }
