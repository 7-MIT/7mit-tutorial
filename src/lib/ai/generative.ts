// Pemilihan komponen visual jawaban AI yang deterministik. Komponen diturunkan dari blok artikel yang sudah tervalidasi,
// lalu divalidasi lagi dengan skema Zod (registri komponen). Model bahasa hanya menulis teks jawaban.
import { AiComponent, type Article, type Block } from '../schemas';
import type { Service } from '../schemas';

type Lang = 'id' | 'en';
const tx = (v: { id: string; en?: string } | undefined, l: Lang) => (v ? (l === 'en' && v.en ? v.en : v.id) : '');
const has = (re: RegExp, q: string) => re.test(q.toLowerCase());

export type Intent = 'tutorial' | 'diagram' | 'trouble' | 'demo' | 'quiz' | 'chart' | 'compare' | 'timeline';
export function detectIntents(q: string): Intent[] {
  const out: Intent[] = [];
  if (has(/trouble|tidak bisa|gagal|error|masalah|lupa|cannot|can't|problem|fail|forgot|stuck|kenapa/, q)) out.push('trouble');
  if (has(/bandingkan|beda|compare|difference|versus|\bvs\b/, q)) out.push('compare');
  if (has(/kuis|latihan|quiz|test me|uji/, q)) out.push('quiz');
  if (has(/grafik|chart|anggaran|budget|statistik/, q)) out.push('chart');
  if (has(/timeline|tahap|urutan|stages|riwayat/, q)) out.push('timeline');
  if (has(/alur|proses|cara kerja|flow|how .*work|diagram|bagaimana .*bekerja/, q)) out.push('diagram');
  if (has(/demo|coba|simulasi|try|simulat/, q)) out.push('demo');
  if (has(/cara|langkah|bagaimana|how to|how do|steps|tutorial|panduan|guide/, q)) out.push('tutorial');
  return out;
}

const findBlock = <K extends Block['kind']>(a: Article, ...kinds: K[]) => a.blocks.find((b) => (kinds as string[]).includes(b.kind)) as Extract<Block, { kind: K }> | undefined;

function fromBlock(b: Block, l: Lang): AiComponent | null {
  switch (b.kind) {
    case 'steps': return { type: 'interactive_tutorial', title: tx(b.title, l) || (l === 'en' ? 'Step by step' : 'Langkah demi langkah'), steps: b.steps.map((s) => ({ title: tx(s.title, l), description: tx(s.text, l) })) };
    case 'flow': return { type: 'flowchart', title: tx(b.title, l) || tx(b.alt, l), nodes: b.nodes.map((n) => ({ id: n.key, label: tx(n.label, l), description: tx(n.text, l), x: n.x, y: n.y })), edges: b.edges.map((e) => ({ from: e.from, to: e.to, label: e.label ? tx(e.label, l) : undefined })) };
    case 'mock': return { type: 'interactive_demo', preset: b.preset, title: tx(b.title, l) || tx(b.caption, l) };
    case 'diagram': return { type: 'animated_diagram', preset: b.preset, title: tx(b.title, l) };
    case 'chart': return { type: 'chart', chart: b.chart, title: tx(b.title, l) || 'Chart', demo: b.demo, points: b.points.map((p) => ({ label: tx(p.label, l), value: p.value })) };
    case 'timeline': return { type: 'timeline', title: tx(b.title, l) || 'Timeline', events: b.events.map((e) => ({ title: tx(e.title, l), text: tx(e.text, l), time: e.time })) };
    case 'quiz': return { type: 'quiz', title: tx(b.title, l), questions: b.questions.map((q) => ({ text: tx(q.text, l), explanation: tx(q.explanation, l), options: q.options.map((o) => ({ label: tx(o.label, l), correct: o.correct })) })) };
    case 'troubleshoot': return { type: 'troubleshooting_tree', title: tx(b.title, l), start: b.start, nodes: b.nodes.map((n) => ({ id: n.key, question: n.question ? tx(n.question, l) : undefined, result: n.result ? tx(n.result, l) : undefined, answers: n.answers.map((a) => ({ label: tx(a.label, l), to: a.to })), article: n.article })) };
    default: return null;
  }
}

function compareServices(svcs: Service[], l: Lang): AiComponent | null {
  const s = svcs.slice(0, 3);
  if (s.length < 2) return null;
  const rows = l === 'en' ? ['Address', 'Status', 'Verified', 'Summary'] : ['Alamat', 'Status', 'Terverifikasi', 'Ringkasan'];
  return { type: 'comparison_table', title: l === 'en' ? 'Service comparison' : 'Perbandingan layanan', columns: s.map((x) => x.name), rows: [
    { label: rows[0], cells: s.map((x) => x.host) }, { label: rows[1], cells: s.map((x) => x.status) },
    { label: rows[2], cells: s.map((x) => (x.verified ? (l === 'en' ? 'Yes' : 'Ya') : (l === 'en' ? 'No' : 'Belum'))) }, { label: rows[3], cells: s.map((x) => tx(x.summary, l)) },
  ] };
}

/** Pilih maksimal dua komponen dari artikel teratas berdasarkan maksud pertanyaan. */
export function pickComponents(q: string, articles: Article[], services: Service[], l: Lang): AiComponent[] {
  const intents = detectIntents(q);
  const out: AiComponent[] = [];
  const tryAdd = (c: AiComponent | null) => { if (!c || out.length >= 2) return; const ok = AiComponent.safeParse(c); if (ok.success && !out.some((o) => o.type === ok.data.type)) out.push(ok.data); };
  const mentioned = services.filter((s) => q.toLowerCase().includes(s.slug) || q.toLowerCase().includes(s.name.toLowerCase().split('.')[0]));
  const order: Record<Intent, Block['kind'][]> = { tutorial: ['steps'], diagram: ['diagram', 'flow'], trouble: ['troubleshoot'], demo: ['mock'], quiz: ['quiz'], chart: ['chart'], compare: [], timeline: ['timeline'] };
  for (const it of intents) {
    if (it === 'compare') { tryAdd(compareServices(mentioned.length >= 2 ? mentioned : services.filter((s) => !s.legacy).slice(0, 3), l)); continue; }
    for (const a of articles) { const b = findBlock(a, ...order[it]); if (b) { tryAdd(fromBlock(b, l)); break; } }
  }
  if (!out.length && articles[0]) for (const k of ['steps', 'mock', 'diagram', 'flow', 'troubleshoot'] as const) { const b = findBlock(articles[0], k); if (b) { tryAdd(fromBlock(b, l)); break; } }
  return out;
}

/** AiComponent -> Blok artikel agar dirender oleh komponen visual yang sama. */
export function toBlock(c: AiComponent): Block | null {
  const B = (id?: string) => ({ id: id ?? '' });
  switch (c.type) {
    case 'text': return { kind: 'text', text: B(c.text) };
    case 'interactive_tutorial': return { kind: 'steps', title: B(c.title), steps: c.steps.map((s) => ({ title: B(s.title), text: B(s.description) })) };
    case 'flowchart': return { kind: 'flow', title: B(c.title), alt: B(c.title), nodes: c.nodes.map((n, i) => ({ key: n.id, label: B(n.label), text: B(n.description), x: n.x ?? i * 220, y: n.y ?? (i % 2) * 90 })), edges: c.edges.map((e) => ({ from: e.from, to: e.to, label: e.label ? B(e.label) : undefined })) };
    case 'interactive_demo': return { kind: 'mock', preset: c.preset, title: c.title ? B(c.title) : undefined, caption: B('Demo') };
    case 'chart': return { kind: 'chart', chart: c.chart, title: B(c.title), demo: c.demo, points: c.points.map((p) => ({ label: B(p.label), value: p.value })) };
    case 'timeline': return { kind: 'timeline', title: B(c.title), events: c.events.map((e) => ({ title: B(e.title), text: B(e.text), time: e.time })) };
    case 'quiz': return { kind: 'quiz', title: c.title ? B(c.title) : undefined, questions: c.questions.map((q, i) => ({ key: `q${i}`, text: B(q.text), explanation: B(q.explanation), options: q.options.map((o) => ({ label: B(o.label), correct: o.correct })) })) };
    case 'troubleshooting_tree': return { kind: 'troubleshoot', title: c.title ? B(c.title) : undefined, start: c.start, nodes: c.nodes.map((n) => ({ key: n.id, question: n.question ? B(n.question) : undefined, result: n.result ? B(n.result) : undefined, answers: n.answers.map((a) => ({ label: B(a.label), to: a.to })), article: n.article })) };
    case 'comparison_table': return { kind: 'compare', title: c.title ? B(c.title) : undefined, columns: c.columns.map(B), rows: c.rows.map((r) => ({ label: B(r.label), cells: r.cells.map(B) })) };
    case 'animated_diagram': return { kind: 'diagram', preset: c.preset, title: c.title ? B(c.title) : undefined, caption: B('') };
    default: return null;
  }
}
