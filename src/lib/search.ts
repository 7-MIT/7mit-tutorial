import MiniSearch from 'minisearch';
import type { Bundle } from './content';
import { plainBlocks, tr } from './content';

export type Hit = { id: string; kind: 'article' | 'service'; slug: string; title: string; summary: string; category: string; service: string; score: number; terms: string[]; text: string };
export function buildIndex(b: Bundle, lang: 'id' | 'en') {
  const docs = [
    ...b.articles.map((a) => ({ id: 'a:' + a.slug, kind: 'article', slug: a.slug, title: tr(a.title, lang), summary: tr(a.summary, lang), category: a.category, service: a.service, text: plainBlocks(a, lang) })),
    ...b.services.map((s) => ({ id: 's:' + s.slug, kind: 'service', slug: s.slug, title: s.name, summary: tr(s.summary, lang), category: s.category, service: s.slug, text: s.host })),
  ];
  const ms = new MiniSearch({ fields: ['title', 'summary', 'text'], storeFields: ['kind', 'slug', 'title', 'summary', 'category', 'service', 'text'], searchOptions: { boost: { title: 4, summary: 2 }, fuzzy: 0.2, prefix: true } });
  ms.addAll(docs);
  return ms;
}
export function runSearch(ms: MiniSearch, q: string, f: { category?: string; service?: string; kind?: string } = {}): Hit[] {
  if (!q.trim()) return [];
  return ms.search(q, { filter: (r) => (!f.category || r.category === f.category) && (!f.service || r.service === f.service) && (!f.kind || r.kind === f.kind) }).slice(0, 30) as unknown as Hit[];
}
export function highlight(text: string, terms: string[]): { t: string; m: boolean }[] {
  const ts = [...new Set(terms.map((x) => x.toLowerCase()).filter((x) => x.length > 1))];
  if (!ts.length) return [{ t: text, m: false }];
  const re = new RegExp('(' + ts.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig');
  return text.split(re).filter(Boolean).map((p) => ({ t: p, m: ts.includes(p.toLowerCase()) }));
}
export const snippet = (text: string, terms: string[], len = 140) => {
  const low = text.toLowerCase(); let at = -1;
  for (const t of terms) { const i = low.indexOf(t.toLowerCase()); if (i >= 0 && (at < 0 || i < at)) at = i; }
  const s = Math.max(0, at - 40); return (s > 0 ? '…' : '') + text.slice(s, s + len).replace(/\s+/g, ' ');
};
export const RECENT_KEY = 't7-recent';
export const getRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
export const addRecent = (q: string) => { try { const r = [q, ...getRecent().filter((x) => x !== q)].slice(0, 6); localStorage.setItem(RECENT_KEY, JSON.stringify(r)); } catch { /* abaikan */ } };
