// Pemetaan antara model artikel bersarang (dipakai antarmuka) dan baris tabel datar kelas7mit_tutorial_*.
// Murni TypeScript tanpa impor: dipakai oleh edge function (Deno), skrip seed/snapshot (Node), dan pengujian.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Bi = { id: string; en?: string };
const bi = (id: any, en: any): Bi => ({ id: String(id ?? ''), ...(en ? { en: String(en) } : {}) });
const idOf = (v?: Bi) => v?.id ?? '';
const enOf = (v?: Bi) => v?.en ?? '';

export interface ItemRow { role: string; key?: string; parent_key?: string; label_id?: string; label_en?: string; text_id?: string; text_en?: string; hint_id?: string; hint_en?: string; flag?: boolean; num_a?: number; num_b?: number; target?: string }
export interface BlockRow { kind: string; title_id?: string; title_en?: string; text_id?: string; text_en?: string; note_id?: string; note_en?: string; variant?: string; tone?: string; url?: string; unit?: string; level?: number; flag?: boolean; extra?: string; items: ItemRow[] }

const item = (role: string, o: Partial<ItemRow> = {}): ItemRow => ({ role, ...o });
const L = (v?: Bi) => ({ label_id: idOf(v), label_en: enOf(v) });
const T = (v?: Bi) => ({ text_id: idOf(v), text_en: enOf(v) });

/** Blok bersarang -> baris blok + item. */
export function blockToRow(b: any): BlockRow {
  const r: BlockRow = { kind: b.kind, items: [] };
  const title = b.title as Bi | undefined;
  if (title) { r.title_id = idOf(title); r.title_en = enOf(title); }
  switch (b.kind) {
    case 'heading': r.level = b.level ?? 2; r.text_id = idOf(b.text); r.text_en = enOf(b.text); break;
    case 'text': r.text_id = idOf(b.text); r.text_en = enOf(b.text); break;
    case 'list': r.flag = !!b.ordered; r.items = b.items.map((x: Bi) => item('item', L(x))); break;
    case 'callout': r.tone = b.tone; r.text_id = idOf(b.text); r.text_en = enOf(b.text); break;
    case 'image': r.url = b.url; r.text_id = idOf(b.alt); r.text_en = enOf(b.alt); r.note_id = idOf(b.caption); r.note_en = enOf(b.caption); break;
    case 'video': r.url = b.url; r.note_id = idOf(b.caption); r.note_en = enOf(b.caption); break;
    case 'code': r.variant = b.language; r.text_id = b.code; break;
    case 'tabs': r.items = b.tabs.map((x: any) => item('tab', { ...L(x.label), ...T(x.text) })); break;
    case 'steps': r.items = b.steps.map((x: any) => item('step', { ...L(x.title), ...T(x.text), hint_id: idOf(x.hint), hint_en: enOf(x.hint) })); break;
    case 'flow':
      r.text_id = idOf(b.alt); r.text_en = enOf(b.alt);
      r.items = [
        ...b.nodes.map((n: any) => item('node', { key: n.key, ...L(n.label), ...T(n.text), num_a: n.x, num_b: n.y, target: n.tone ?? '' })),
        ...b.edges.map((e: any) => item('edge', { key: e.from, parent_key: e.to, ...L(e.label) })),
      ]; break;
    case 'mock': case 'diagram': r.variant = b.preset; r.note_id = idOf(b.caption); r.note_en = enOf(b.caption); break;
    case 'chart':
      r.variant = b.chart; r.flag = !!b.demo; r.unit = b.unit ?? ''; r.note_id = idOf(b.note); r.note_en = enOf(b.note);
      r.items = b.points.map((p: any) => item('point', { ...L(p.label), num_a: p.value })); break;
    case 'troubleshoot':
      r.extra = b.start;
      r.items = b.nodes.flatMap((n: any) => [
        item('node', { key: n.key, label_id: idOf(n.question), label_en: enOf(n.question), text_id: idOf(n.result), text_en: enOf(n.result), target: n.article ?? '' }),
        ...(n.answers ?? []).map((a: any) => item('answer', { parent_key: n.key, ...L(a.label), target: a.to })),
      ]); break;
    case 'scrolly': r.variant = b.preset; r.items = b.steps.map((s: any) => item('step', { ...L(s.title), ...T(s.text), target: s.focus ?? '' })); break;
    case 'quiz':
      r.items = b.questions.flatMap((q: any) => [
        item('question', { key: q.key, ...L(q.text), ...T(q.explanation) }),
        ...q.options.map((o: any) => item('option', { parent_key: q.key, ...L(o.label), flag: !!o.correct })),
      ]); break;
    case 'compare':
      r.items = [
        ...b.columns.map((c: Bi) => item('column', L(c))),
        ...b.rows.flatMap((row: any, i: number) => [item('row', { key: `r${i + 1}`, ...L(row.label) }), ...row.cells.map((c: Bi, j: number) => item('cell', { parent_key: `r${i + 1}`, ...L(c), num_a: j }))]),
      ]; break;
    case 'timeline': r.items = b.events.map((e: any) => item('event', { ...L(e.title), ...T(e.text), target: e.time ?? '' })); break;
    default: throw new Error('Jenis blok tidak dikenal: ' + b.kind);
  }
  return r;
}

const pick = (id?: string | null, en?: string | null): Bi => bi(id, en);

/** Baris blok + item -> blok bersarang. */
export function rowToBlock(r: any, items: any[]): any {
  const its = [...items].sort((a, b) => a.position - b.position);
  const of = (role: string) => its.filter((i) => i.role === role);
  const lab = (i: any) => pick(i.label_id, i.label_en);
  const txt = (i: any) => pick(i.text_id, i.text_en);
  const title = r.title_id || r.title_en ? { title: pick(r.title_id, r.title_en) } : {};
  switch (r.kind) {
    case 'heading': return { kind: 'heading', level: r.level === 3 ? 3 : 2, text: pick(r.text_id, r.text_en) };
    case 'text': return { kind: 'text', text: pick(r.text_id, r.text_en) };
    case 'list': return { kind: 'list', ordered: !!r.flag, items: of('item').map(lab) };
    case 'callout': return { kind: 'callout', tone: r.tone || 'info', ...title, text: pick(r.text_id, r.text_en) };
    case 'image': return { kind: 'image', url: r.url, alt: pick(r.text_id, r.text_en), ...(r.note_id ? { caption: pick(r.note_id, r.note_en) } : {}) };
    case 'video': return { kind: 'video', url: r.url, ...(r.note_id ? { caption: pick(r.note_id, r.note_en) } : {}) };
    case 'code': return { kind: 'code', language: r.variant || 'text', code: r.text_id };
    case 'tabs': return { kind: 'tabs', tabs: of('tab').map((i) => ({ label: lab(i), text: txt(i) })) };
    case 'steps': return { kind: 'steps', ...title, steps: of('step').map((i) => ({ title: lab(i), text: txt(i), ...(i.hint_id ? { hint: pick(i.hint_id, i.hint_en) } : {}) })) };
    case 'flow': return {
      kind: 'flow', ...title, alt: pick(r.text_id, r.text_en),
      nodes: of('node').map((i) => ({ key: i.key, label: lab(i), text: txt(i), x: i.num_a, y: i.num_b, ...(i.target ? { tone: i.target } : {}) })),
      edges: of('edge').map((i) => ({ from: i.key, to: i.parent_key, ...(i.label_id ? { label: lab(i) } : {}) })),
    };
    case 'mock': case 'diagram': return { kind: r.kind, preset: r.variant, ...title, ...(r.note_id ? { caption: pick(r.note_id, r.note_en) } : {}) };
    case 'chart': return { kind: 'chart', chart: r.variant || 'bar', ...title, demo: !!r.flag, ...(r.unit ? { unit: r.unit } : {}), points: of('point').map((i) => ({ label: lab(i), value: i.num_a })), ...(r.note_id ? { note: pick(r.note_id, r.note_en) } : {}) };
    case 'troubleshoot': return {
      kind: 'troubleshoot', ...title, start: r.extra,
      nodes: of('node').map((n) => ({
        key: n.key, ...(n.label_id ? { question: lab(n) } : {}), ...(n.text_id ? { result: txt(n) } : {}),
        answers: of('answer').filter((a) => a.parent_key === n.key).map((a) => ({ label: lab(a), to: a.target })), ...(n.target ? { article: n.target } : {}),
      })),
    };
    case 'scrolly': return { kind: 'scrolly', ...title, preset: r.variant, steps: of('step').map((i) => ({ title: lab(i), text: txt(i), focus: i.target || '' })) };
    case 'quiz': return {
      kind: 'quiz', ...title,
      questions: of('question').map((q) => ({ key: q.key, text: lab(q), explanation: txt(q), options: of('option').filter((o) => o.parent_key === q.key).map((o) => ({ label: lab(o), correct: !!o.flag })) })),
    };
    case 'compare': return {
      kind: 'compare', ...title, columns: of('column').map(lab),
      rows: of('row').map((row) => ({ label: lab(row), cells: of('cell').filter((c) => c.parent_key === row.key).sort((a, b) => a.num_a - b.num_a).map(lab) })),
    };
    case 'timeline': return { kind: 'timeline', ...title, events: of('event').map((i) => ({ title: lab(i), text: txt(i), ...(i.target ? { time: i.target } : {}) })) };
    default: return { kind: 'text', text: pick('', '') };
  }
}

/** Artikel bersarang -> muatan untuk fungsi tutorial_save_article. */
export function articleToPayload(a: any) {
  return {
    article: {
      slug: a.slug, service_slug: a.service, category_slug: a.category, title_id: idOf(a.title), title_en: enOf(a.title), summary_id: idOf(a.summary), summary_en: enOf(a.summary),
      status: a.status, verified: !!a.verified, featured: !!a.featured, popular: !!a.popular, minutes: a.minutes ?? 3,
      ...(a.createdAt ? { created_at: a.createdAt } : {}), ...(a.updatedAt ? { updated_at: a.updatedAt } : {}),
    },
    services: [...new Set([a.service, ...(a.services ?? [])])],
    blocks: a.blocks.map(blockToRow),
  };
}

/** Kumpulan baris tabel -> bundel konten bersarang. */
export function rowsToBundle(t: { services: any[]; categories: any[]; articles: any[]; article_services: any[]; blocks: any[]; items: any[] }) {
  const itemsByBlock = new Map<string, any[]>();
  for (const i of t.items) { const k = i.block_id; (itemsByBlock.get(k) ?? itemsByBlock.set(k, []).get(k)!).push(i); }
  const blocksByArticle = new Map<string, any[]>();
  for (const b of t.blocks) { (blocksByArticle.get(b.article_id) ?? blocksByArticle.set(b.article_id, []).get(b.article_id)!).push(b); }
  const svcByArticle = new Map<string, string[]>();
  for (const s of t.article_services) { (svcByArticle.get(s.article_id) ?? svcByArticle.set(s.article_id, []).get(s.article_id)!).push(s.service_slug); }
  return {
    generatedAt: new Date().toISOString(),
    categories: t.categories.map((c) => ({ slug: c.slug, name: pick(c.name_id, c.name_en), description: pick(c.description_id, c.description_en), icon: c.icon, sort: c.sort_order })),
    services: t.services.map((s) => ({
      slug: s.slug, name: s.name, host: s.host, url: s.url, category: s.category_slug, status: s.status, verified: !!s.verified, verifiedAt: s.verified_at ?? null, verifiedNote: s.verified_note ?? '',
      summary: pick(s.summary_id, s.summary_en), icon: s.icon, logoUrl: s.logo_url ?? '', legacy: !!s.legacy, sort: s.sort_order,
    })),
    articles: t.articles.map((a) => ({
      id: a.id, slug: a.slug, service: a.service_slug, services: svcByArticle.get(a.id) ?? [a.service_slug], category: a.category_slug,
      title: pick(a.title_id, a.title_en), summary: pick(a.summary_id, a.summary_en), status: a.status, verified: !!a.verified, featured: !!a.featured, popular: !!a.popular,
      minutes: a.minutes, version: a.version, createdAt: a.created_at, updatedAt: a.updated_at, author: a.author ?? '',
      blocks: (blocksByArticle.get(a.id) ?? []).sort((x, y) => x.position - y.position).map((b) => rowToBlock(b, itemsByBlock.get(b.id) ?? [])),
    })),
  };
}

export const serviceToRow = (s: any) => ({
  slug: s.slug, name: s.name, host: s.host ?? '', url: s.url ?? '', category_slug: s.category, status: s.status, verified: !!s.verified, verified_at: s.verifiedAt ?? null, verified_note: s.verifiedNote ?? '',
  summary_id: idOf(s.summary), summary_en: enOf(s.summary), icon: s.icon ?? 'globe', logo_url: s.logoUrl ?? '', legacy: !!s.legacy, sort_order: s.sort ?? 0, updated_at: new Date().toISOString(),
});
export const categoryToRow = (c: any) => ({ slug: c.slug, name_id: idOf(c.name), name_en: enOf(c.name), description_id: idOf(c.description), description_en: enOf(c.description), icon: c.icon ?? 'folder', sort_order: c.sort ?? 0, updated_at: new Date().toISOString() });
