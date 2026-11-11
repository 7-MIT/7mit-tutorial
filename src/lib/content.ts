import snapshot from '../../content/snapshot.json';
import type { Article, Bi, Category, Service } from './schemas';
import { hasVisual } from './schemas';

export type Bundle = { generatedAt: string; categories: Category[]; services: Service[]; articles: Article[] };
export const API = 'https://lajzrempjyoqkubkumhb.supabase.co/functions/v1/tutorial-api';
export const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhanpyZW1wanlvcWt1Ymt1bWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODUzNDQsImV4cCI6MjEwMDQ2MTM0NH0.qM1qzhIPin7U1StnPP5n_0xEMRYTdl3Isy1HHahK8dQ';
export const bundle0 = snapshot as unknown as Bundle;

export const tr = (v: Bi | undefined, lang: 'id' | 'en') => (v ? (lang === 'en' && v.en ? v.en : v.id) : '');
export const byService = (b: Bundle, slug: string) => b.articles.filter((a) => a.services.includes(slug));
export const byCategory = (b: Bundle, slug: string) => b.articles.filter((a) => a.category === slug);
export const findArticle = (b: Bundle, slug: string) => b.articles.find((a) => a.slug === slug);
export const findService = (b: Bundle, slug: string) => b.services.find((s) => s.slug === slug);
export const articleOk = (a: Article) => hasVisual(a.blocks);

/** Teks datar untuk pencarian dan RAG. */
export function plainBlocks(a: Article, lang: 'id' | 'en'): string {
  const t = (v?: Bi) => tr(v, lang);
  const out: string[] = [];
  for (const b of a.blocks) {
    switch (b.kind) {
      case 'heading': case 'text': out.push(t(b.text)); break;
      case 'callout': out.push(t(b.title), t(b.text)); break;
      case 'list': out.push(...b.items.map(t)); break;
      case 'steps': out.push(t(b.title), ...b.steps.flatMap((s) => [t(s.title), t(s.text)])); break;
      case 'tabs': out.push(...b.tabs.flatMap((s) => [t(s.label), t(s.text)])); break;
      case 'flow': out.push(t(b.title), t(b.alt), ...b.nodes.flatMap((n) => [t(n.label), t(n.text)])); break;
      case 'troubleshoot': out.push(t(b.title), ...b.nodes.flatMap((n) => [t(n.question), t(n.result)])); break;
      case 'quiz': out.push(...b.questions.flatMap((q) => [t(q.text), t(q.explanation)])); break;
      case 'timeline': out.push(...b.events.flatMap((e) => [t(e.title), t(e.text)])); break;
      case 'compare': out.push(...b.rows.map((r) => t(r.label))); break;
      case 'scrolly': out.push(...b.steps.flatMap((s) => [t(s.title), t(s.text)])); break;
      case 'mock': case 'diagram': out.push(t(b.title), t(b.caption)); break;
      case 'chart': out.push(t(b.title), t(b.note)); break;
      default: break;
    }
  }
  return out.filter(Boolean).join('\n');
}

export const STATUS_LABEL: Record<string, Bi> = {
  active: { id: 'Aktif', en: 'Active' }, beta: { id: 'Beta', en: 'Beta' }, planned: { id: 'Rencana', en: 'Planned' },
  deprecated: { id: 'Digantikan', en: 'Deprecated' }, archived: { id: 'Arsip', en: 'Archived' },
};
export const STATUS_TONE: Record<string, string> = { active: 'bg-success-soft text-success', beta: 'bg-info-soft text-info', planned: 'bg-warning-soft text-warning', deprecated: 'bg-danger-soft text-danger', archived: 'bg-sunken text-muted' };
