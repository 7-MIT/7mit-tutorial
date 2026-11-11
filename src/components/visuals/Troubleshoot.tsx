'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CircleHelp, CircleCheck, RotateCcw, Undo2 } from 'lucide-react';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';

type T = Extract<Block, { kind: 'troubleshoot' }>;
export function Troubleshoot({ b }: { b: T }) {
  const { tr, t } = useApp();
  const [path, setPath] = useState<string[]>([b.start]);
  const cur = b.nodes.find((n) => n.key === path[path.length - 1]);
  if (!cur) return null;
  return (
    <div className="rounded-lg border border-line bg-raised p-5 shadow-card">
      {b.title && <h3 className="font-display text-lg mb-3">{tr(b.title)}</h3>}
      <ol className="grid gap-2 mb-4 text-sm text-muted">
        {path.slice(0, -1).map((k, i) => { const n = b.nodes.find((x) => x.key === k)!; const chosen = n.answers.find((a) => a.to === path[i + 1]); return <li key={i} className="flex gap-2"><CircleCheck size={16} className="text-success shrink-0 mt-0.5" aria-hidden /><span>{tr(n.question)} → <b className="text-ink">{chosen ? tr(chosen.label) : ''}</b></span></li>; })}
      </ol>
      <div aria-live="polite" className={`rounded-md p-4 ${cur.result ? 'bg-success-soft' : 'bg-sunken'}`}>
        {cur.question && <p className="flex gap-2 font-medium"><CircleHelp size={20} className="text-brand shrink-0" aria-hidden />{tr(cur.question)}</p>}
        {cur.result && <p className="text-success">{tr(cur.result)}</p>}
        {cur.question && <div className="mt-3 flex flex-wrap gap-2">{cur.answers.map((a, i) => <button key={i} type="button" onClick={() => setPath([...path, a.to])} className="rounded-full bg-brand text-on-brand px-4 py-2 text-sm hover:bg-brand-hover">{tr(a.label)}</button>)}</div>}
        {cur.article && <Link href={`/help/article/${cur.article}/`} className="mt-3 inline-block text-brand underline">{t('related')} →</Link>}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={path.length < 2} onClick={() => setPath(path.slice(0, -1))} className="inline-flex items-center gap-1 text-sm text-muted disabled:opacity-40 hover:text-ink"><Undo2 size={14} aria-hidden />{t('back')}</button>
        <button type="button" onClick={() => setPath([b.start])} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><RotateCcw size={14} aria-hidden />{t('restart')}</button>
      </div>
    </div>
  );
}
