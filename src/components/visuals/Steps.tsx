'use client';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';

type S = Extract<Block, { kind: 'steps' }>;
export function Steps({ b }: { b: S }) {
  const { tr, t } = useApp();
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const n = b.steps.length;
  const cur = b.steps[i];
  return (
    <div className="rounded-lg border border-line bg-raised p-5 shadow-card">
      {b.title && <h3 className="font-display text-lg mb-3">{tr(b.title)}</h3>}
      <ol className="flex items-center gap-2 mb-4" aria-label={`${i + 1} / ${n}`}>
        {b.steps.map((s, k) => (
          <li key={k} className="flex-1">
            <button type="button" onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined} aria-label={tr(s.title)} className="w-full group focus-visible:outline-2 focus-visible:outline-focus rounded">
              <span className={`block h-1.5 rounded-full transition-colors ${k <= i ? 'bg-brand' : 'bg-line'}`} />
              <span className={`mt-1 hidden sm:flex items-center gap-1 text-xs ${k === i ? 'text-ink font-semibold' : 'text-muted'}`}>{k < i ? <Check size={12} aria-hidden /> : <span>{k + 1}.</span>}<span className="truncate">{tr(s.title)}</span></span>
            </button>
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="min-h-[110px]">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <p className="text-xs uppercase tracking-wide text-muted">{i + 1} / {n}</p>
            <h4 className="font-display text-xl mt-1">{tr(cur.title)}</h4>
            <p className="mt-2 text-ink/90">{tr(cur.text)}</p>
            {cur.hint && <p className="mt-3 flex gap-2 rounded-md bg-warning-soft text-warning px-3 py-2 text-sm"><Lightbulb size={16} className="shrink-0 mt-0.5" aria-hidden />{tr(cur.hint)}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40 hover:bg-sunken"><ChevronLeft size={16} aria-hidden />{t('prev')}</button>
        {i < n - 1 ? <button type="button" onClick={() => setI(i + 1)} className="inline-flex items-center gap-1 rounded-full bg-brand text-on-brand px-4 py-2 text-sm hover:bg-brand-hover">{t('next')}<ChevronRight size={16} aria-hidden /></button>
          : <button type="button" onClick={() => setI(0)} className="rounded-full border border-line px-4 py-2 text-sm hover:bg-sunken">{t('restart')}</button>}
      </div>
    </div>
  );
}
