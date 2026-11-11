// Pengambilan konteks (RAG) dari artikel yang sama dengan pusat bantuan, memakai MiniSearch. Berjalan sepenuhnya di peramban.
import type MiniSearch from 'minisearch';
import type { Article, Service } from '../schemas';
import { plainBlocks, tr } from '../content';
import { runSearch } from '../search';

export type Retrieval = { articles: Article[]; services: Service[]; context: string; sources: { slug: string; title: string }[] };
export function retrieve(ms: MiniSearch, q: string, articles: Article[], services: Service[], lang: 'id' | 'en', pinned?: string): Retrieval {
  const hits = runSearch(ms, q).filter((h) => h.kind === 'article');
  const arts: Article[] = [];
  const add = (slug: string) => { const a = articles.find((x) => x.slug === slug); if (a && !arts.includes(a)) arts.push(a); };
  if (pinned) add(pinned);
  for (const h of hits) add(h.slug);
  const top = arts.slice(0, 3);
  const svc = services.filter((s) => top.some((a) => a.services.includes(s.slug)));
  const context = top.map((a, i) => `[${i + 1}] ${tr(a.title, lang)}\n${plainBlocks(a, lang).slice(0, 900)}`).join('\n\n') + (svc.length ? '\n\n' + svc.map((s) => `${s.name} (${s.host}) — status: ${s.status}${s.verified ? '' : ', unverified'}`).join('\n') : '');
  return { articles: top, services: svc, context, sources: top.map((a) => ({ slug: a.slug, title: tr(a.title, lang) })) };
}

export const systemPrompt = (lang: 'id' | 'en', context: string) => (lang === 'en'
  ? `You are 7 MIT Help AI. Answer briefly (max 5 sentences) using ONLY the context below. If the context does not contain the answer, say you are not sure and suggest contacting halo@7mit.org. Never ask for passwords. Do not invent services or features.\n\nContext:\n${context}`
  : `Kamu adalah 7 MIT Help AI. Jawab singkat (maksimal 5 kalimat) HANYA berdasarkan konteks di bawah. Jika konteks tidak memuat jawabannya, katakan belum yakin dan sarankan menghubungi halo@7mit.org. Jangan pernah meminta kata sandi. Jangan mengarang layanan atau fitur.\n\nKonteks:\n${context}`);

/** Jawaban cadangan tanpa model: ringkasan artikel teratas. */
export function fallbackAnswer(r: Retrieval, lang: 'id' | 'en'): string {
  const a = r.articles[0];
  if (!a) return lang === 'en' ? 'I could not find a matching article. Try other words, or contact halo@7mit.org.' : 'Saya tidak menemukan artikel yang cocok. Coba kata lain, atau hubungi halo@7mit.org.';
  const s = r.services.find((x) => x.slug === a.service);
  const warn = s && !s.verified ? (lang === 'en' ? ` Note: ${s.name} is not verified as available.` : ` Catatan: ${s.name} belum terverifikasi tersedia.`) : '';
  return `${tr(a.summary, lang)}${warn}`;
}
