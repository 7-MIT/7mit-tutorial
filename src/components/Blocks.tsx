'use client';
import dynamic from 'next/dynamic';
import { AlertTriangle, CheckCircle2, Info, Lightbulb, PencilRuler } from 'lucide-react';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';
import { Diagram } from './visuals/Diagram';
import { Mock } from './visuals/Mock';
import { Steps } from './visuals/Steps';
import { Troubleshoot } from './visuals/Troubleshoot';
import { Scrolly } from './visuals/Scrolly';
import { Quiz } from './visuals/Quiz';
import { Compare, Timeline } from './visuals/Simple';

const Flow = dynamic(() => import('./visuals/Flow'), { ssr: false, loading: () => <div className="h-[320px] rounded-lg bg-sunken animate-pulse" /> });
const Chart = dynamic(() => import('./visuals/Chart'), { ssr: false, loading: () => <div className="h-64 rounded-lg bg-sunken animate-pulse" /> });

const TONE: Record<string, { cls: string; Icon: typeof Info }> = {
  info: { cls: 'bg-info-soft text-info', Icon: Info }, tip: { cls: 'bg-success-soft text-success', Icon: Lightbulb }, warning: { cls: 'bg-warning-soft text-warning', Icon: AlertTriangle },
  draft: { cls: 'bg-sunken text-muted border border-dashed border-line-strong', Icon: PencilRuler }, verified: { cls: 'bg-success-soft text-success', Icon: CheckCircle2 },
};
export const headingId = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function Blocks({ blocks }: { blocks: Block[] }) {
  const { tr } = useApp();
  return (
    <div className="grid gap-6">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'heading': { const x = tr(b.text); const H = b.level === 3 ? 'h3' : 'h2'; return <H key={i} id={headingId(x)} className={`font-display scroll-mt-24 ${b.level === 3 ? 'text-xl' : 'text-2xl'} text-ink`}>{x}</H>; }
          case 'text': return <p key={i} className="leading-relaxed text-ink/90 whitespace-pre-line">{tr(b.text)}</p>;
          case 'list': { const L = b.ordered ? 'ol' : 'ul'; return <L key={i} className={`${b.ordered ? 'list-decimal' : 'list-disc'} pl-6 grid gap-1`}>{b.items.map((x, k) => <li key={k}>{tr(x)}</li>)}</L>; }
          case 'callout': { const { cls, Icon } = TONE[b.tone] ?? TONE.info; return <aside key={i} className={`rounded-md p-4 flex gap-3 ${cls}`}><Icon size={20} className="shrink-0 mt-0.5" aria-hidden /><div>{b.title && <p className="font-semibold">{tr(b.title)}</p>}<p>{tr(b.text)}</p></div></aside>; }
          case 'image': return <figure key={i}><img src={b.url} alt={tr(b.alt)} loading="lazy" className="rounded-lg border border-line max-w-full" />{b.caption && <figcaption className="text-sm text-muted mt-1">{tr(b.caption)}</figcaption>}</figure>;
          case 'video': return <figure key={i}><video src={b.url} controls preload="none" className="rounded-lg w-full" />{b.caption && <figcaption className="text-sm text-muted mt-1">{tr(b.caption)}</figcaption>}</figure>;
          case 'code': return <pre key={i} className="rounded-md bg-sunken p-4 overflow-x-auto text-sm"><code>{b.code}</code></pre>;
          case 'tabs': return <Tabs key={i} b={b} />;
          case 'steps': return <Steps key={i} b={b} />;
          case 'flow': return <Flow key={i} b={b} />;
          case 'mock': return <figure key={i}>{b.title && <h3 className="font-display text-lg mb-2">{tr(b.title)}</h3>}<Mock preset={b.preset} />{b.caption && <figcaption className="text-sm text-muted mt-1">{tr(b.caption)}</figcaption>}</figure>;
          case 'diagram': return <figure key={i} className="rounded-lg border border-line bg-raised p-3 shadow-card">{b.title && <h3 className="font-display text-lg px-2">{tr(b.title)}</h3>}<Diagram preset={b.preset} />{b.caption && <figcaption className="text-sm text-muted px-2">{tr(b.caption)}</figcaption>}</figure>;
          case 'chart': return <Chart key={i} b={b} />;
          case 'troubleshoot': return <Troubleshoot key={i} b={b} />;
          case 'scrolly': return <Scrolly key={i} b={b} />;
          case 'quiz': return <Quiz key={i} b={b} />;
          case 'compare': return <Compare key={i} b={b} />;
          case 'timeline': return <Timeline key={i} b={b} />;
          default: return null;
        }
      })}
    </div>
  );
}

import { useState } from 'react';
function Tabs({ b }: { b: Extract<Block, { kind: 'tabs' }> }) {
  const { tr } = useApp();
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-line">{b.tabs.map((t, k) => <button key={k} role="tab" aria-selected={k === i} onClick={() => setI(k)} className={`px-4 py-2 text-sm -mb-px border-b-2 ${k === i ? 'border-brand text-ink font-semibold' : 'border-transparent text-muted'}`}>{tr(t.label)}</button>)}</div>
      <div role="tabpanel" className="pt-3">{tr(b.tabs[i].text)}</div>
    </div>
  );
}
