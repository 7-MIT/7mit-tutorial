import { z } from 'zod';

/** Teks dua bahasa. `en` boleh kosong: tampilan jatuh kembali ke Indonesia. */
export const Bi = z.object({ id: z.string(), en: z.string().optional() });
export type Bi = z.infer<typeof Bi>;

export const SERVICE_STATUSES = ['active', 'beta', 'planned', 'deprecated', 'archived'] as const;
export const ServiceStatus = z.enum(SERVICE_STATUSES);
export type ServiceStatus = z.infer<typeof ServiceStatus>;

export const MOCK_PRESETS = [
  'login-akun', 'recover-password', 'sessions-devices', 'oneclass-dashboard', 'ai-chat', 'quiz-join', 'quiz-answer',
  'link-shorten', 'anggaran-explorer', 'status-board', 'whiteboard-tools', 'form-fill', 'file-manager', 'deploy-wizard', 'display-board',
] as const;
export const DIAGRAM_PRESETS = [
  'auth-flow', 'client-server', 'cloud-storage', 'ai-generation', 'quiz-submit', 'short-url', 'static-vs-dynamic', 'service-registry', 'role-access', 'data-flow',
] as const;
export const MockPreset = z.enum(MOCK_PRESETS);
export const DiagramPreset = z.enum(DIAGRAM_PRESETS);

const key = z.string().regex(/^[a-z0-9_-]{1,40}$/i);

export const StepItem = z.object({ title: Bi, text: Bi, hint: Bi.optional() });
export const FlowNode = z.object({ key, label: Bi, text: Bi, x: z.number(), y: z.number(), tone: z.enum(['default', 'start', 'end', 'warn']).optional() });
export const FlowEdge = z.object({ from: key, to: key, label: Bi.optional() });
export const TreeNode = z.object({
  key, question: Bi.optional(), result: Bi.optional(),
  answers: z.array(z.object({ label: Bi, to: key })).default([]),
  article: z.string().optional(),
});
export const QuizQuestion = z.object({
  key, text: Bi, explanation: Bi,
  options: z.array(z.object({ label: Bi, correct: z.boolean() })).min(2).max(6),
});

export const Block = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('heading'), level: z.union([z.literal(2), z.literal(3)]).default(2), text: Bi }),
  z.object({ kind: z.literal('text'), text: Bi }),
  z.object({ kind: z.literal('list'), ordered: z.boolean().default(false), items: z.array(Bi).min(1) }),
  z.object({ kind: z.literal('callout'), tone: z.enum(['info', 'tip', 'warning', 'draft', 'verified']), title: Bi.optional(), text: Bi }),
  z.object({ kind: z.literal('image'), url: z.string().min(1), alt: Bi, caption: Bi.optional() }),
  z.object({ kind: z.literal('video'), url: z.string().min(1), caption: Bi.optional() }),
  z.object({ kind: z.literal('code'), language: z.string().default('text'), code: z.string() }),
  z.object({ kind: z.literal('tabs'), tabs: z.array(z.object({ label: Bi, text: Bi })).min(1) }),
  z.object({ kind: z.literal('steps'), title: Bi.optional(), steps: z.array(StepItem).min(2) }),
  z.object({ kind: z.literal('flow'), title: Bi.optional(), alt: Bi, nodes: z.array(FlowNode).min(2), edges: z.array(FlowEdge).min(1) }),
  z.object({ kind: z.literal('mock'), preset: MockPreset, title: Bi.optional(), caption: Bi.optional() }),
  z.object({ kind: z.literal('diagram'), preset: DiagramPreset, title: Bi.optional(), caption: Bi.optional() }),
  z.object({
    kind: z.literal('chart'), chart: z.enum(['bar', 'line', 'pie']), title: Bi.optional(), demo: z.boolean().default(true), unit: z.string().optional(),
    points: z.array(z.object({ label: Bi, value: z.number() })).min(2), note: Bi.optional(),
  }),
  z.object({ kind: z.literal('troubleshoot'), title: Bi.optional(), start: key, nodes: z.array(TreeNode).min(2) }),
  z.object({ kind: z.literal('scrolly'), title: Bi.optional(), preset: DiagramPreset, steps: z.array(z.object({ title: Bi, text: Bi, focus: z.string().default('') })).min(2) }),
  z.object({ kind: z.literal('quiz'), title: Bi.optional(), questions: z.array(QuizQuestion).min(1) }),
  z.object({ kind: z.literal('compare'), title: Bi.optional(), columns: z.array(Bi).min(2), rows: z.array(z.object({ label: Bi, cells: z.array(Bi) })).min(1) }),
  z.object({ kind: z.literal('timeline'), title: Bi.optional(), events: z.array(z.object({ title: Bi, text: Bi, time: z.string().optional() })).min(2) }),
]);
export type Block = z.infer<typeof Block>;
export type BlockKind = Block['kind'];

/** Jenis blok yang dihitung sebagai visual interaktif/animasi bermakna (syarat terbit). */
export const VISUAL_KINDS: BlockKind[] = ['steps', 'flow', 'mock', 'diagram', 'chart', 'troubleshoot', 'scrolly', 'quiz'];
export const hasVisual = (blocks: Block[]) => blocks.some((b) => VISUAL_KINDS.includes(b.kind));

export const Service = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,40}$/),
  name: z.string(), host: z.string(), url: z.string().default(''), category: z.string(),
  status: ServiceStatus, verified: z.boolean(), verifiedAt: z.string().nullable().default(null), verifiedNote: z.string().default(''),
  summary: Bi, icon: z.string().default('globe'), logoUrl: z.string().default(''), legacy: z.boolean().default(false), sort: z.number().default(0),
});
export type Service = z.infer<typeof Service>;

export const Category = z.object({ slug: z.string(), name: Bi, description: Bi, icon: z.string().default('folder'), sort: z.number().default(0) });
export type Category = z.infer<typeof Category>;

export const Article = z.object({
  id: z.string(), slug: z.string().regex(/^[a-z0-9-]{3,90}$/),
  service: z.string(), services: z.array(z.string()).default([]), category: z.string(),
  title: Bi, summary: Bi, status: z.enum(['draft', 'published']), verified: z.boolean(),
  featured: z.boolean().default(false), popular: z.boolean().default(false), minutes: z.number().int().min(1).default(3),
  version: z.number().int().default(1), createdAt: z.string(), updatedAt: z.string(), author: z.string().default(''),
  blocks: z.array(Block),
});
export type Article = z.infer<typeof Article>;

export const ContentBundle = z.object({
  generatedAt: z.string(), services: z.array(Service), categories: z.array(Category), articles: z.array(Article),
});
export type ContentBundle = z.infer<typeof ContentBundle>;

/* ---------- Jawaban AI (Generative UI): hanya komponen dari registri ini yang boleh dirender ---------- */
const aiText = z.string().max(2000);
export const AiSource = z.object({ slug: z.string(), title: z.string(), anchor: z.string().optional() });
export const AiComponent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: aiText }),
  z.object({ type: z.literal('interactive_tutorial'), title: aiText, steps: z.array(z.object({ title: aiText, description: aiText })).min(2).max(12) }),
  z.object({
    type: z.literal('flowchart'), title: aiText,
    nodes: z.array(z.object({ id: key, label: aiText, description: aiText.optional(), x: z.number().optional(), y: z.number().optional() })).min(2).max(14),
    edges: z.array(z.object({ from: key, to: key, label: aiText.optional() })).min(1).max(20),
  }),
  z.object({ type: z.literal('interactive_demo'), preset: MockPreset, title: aiText.optional() }),
  z.object({ type: z.literal('chart'), chart: z.enum(['bar', 'line', 'pie']), title: aiText, demo: z.boolean().default(true), points: z.array(z.object({ label: aiText, value: z.number() })).min(2).max(24) }),
  z.object({ type: z.literal('timeline'), title: aiText, events: z.array(z.object({ title: aiText, text: aiText.optional(), time: aiText.optional() })).min(2).max(12) }),
  z.object({
    type: z.literal('quiz'), title: aiText.optional(),
    questions: z.array(z.object({ text: aiText, explanation: aiText, options: z.array(z.object({ label: aiText, correct: z.boolean() })).min(2).max(6) })).min(1).max(6),
  }),
  z.object({
    type: z.literal('troubleshooting_tree'), title: aiText.optional(), start: key,
    nodes: z.array(z.object({ id: key, question: aiText.optional(), result: aiText.optional(), answers: z.array(z.object({ label: aiText, to: key })).default([]), article: z.string().optional() })).min(2).max(20),
  }),
  z.object({ type: z.literal('comparison_table'), title: aiText.optional(), columns: z.array(aiText).min(2).max(5), rows: z.array(z.object({ label: aiText, cells: z.array(aiText) })).min(1).max(12) }),
  z.object({ type: z.literal('animated_diagram'), preset: DiagramPreset, title: aiText.optional() }),
]);
export type AiComponent = z.infer<typeof AiComponent>;
export const AiResponse = z.object({
  answer: aiText, components: z.array(AiComponent).max(3).default([]), followups: z.array(aiText).max(4).default([]),
  sources: z.array(AiSource).max(6).default([]), grounded: z.boolean().default(true),
});
export type AiResponse = z.infer<typeof AiResponse>;
export const AI_COMPONENT_TYPES = AiComponent.options.map((o) => o.shape.type.value);
