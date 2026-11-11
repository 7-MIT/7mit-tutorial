'use client';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Lock } from 'lucide-react';
import { MOCKS } from '@/lib/mocks';
import { useApp } from '@/lib/i18n';

export function Mock({ preset }: { preset: string }) {
  const { tr, t } = useApp();
  const m = MOCKS[preset];
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  if (!m) return null;
  const s = m.screens[Math.min(i, m.screens.length - 1)];
  return (
    <div className="rounded-lg border border-line bg-raised shadow-card overflow-hidden" role="group" aria-label={`${t('demo')}: ${tr(m.title)}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-sunken border-b border-line text-xs text-muted">
        <span className="flex gap-1" aria-hidden><i className="size-2.5 rounded-full bg-danger-fill" /><i className="size-2.5 rounded-full bg-gold" /><i className="size-2.5 rounded-full bg-success" /></span>
        <span className="flex-1 flex items-center gap-1 rounded-full bg-raised border border-line px-3 py-0.5 truncate"><Lock size={12} aria-hidden />{m.url}</span>
        <span className="rounded-full bg-blush text-ink px-2 py-0.5 font-semibold tracking-wide">{t('demo').toUpperCase()}</span>
      </div>
      <div className="p-5 min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <h4 className="font-display text-xl text-ink flex items-center gap-2">{s.ok && <CheckCircle2 className="text-success" size={22} aria-hidden />}{tr(s.h)}</h4>
            {s.p && <p className="mt-2 text-sm text-muted">{tr(s.p)}</p>}
            {s.fields && <div className="mt-4 grid gap-3 max-w-sm">{s.fields.map((f, k) => (
              <label key={k} className="grid gap-1 text-sm text-muted">{tr(f.l)}<input readOnly tabIndex={-1} aria-readonly value={f.v} type="text" className="rounded-md border border-line bg-sunken px-3 py-2 text-ink select-none" /></label>))}</div>}
            {s.chips && <div className="mt-4 flex flex-wrap gap-2">{s.chips.map((c, k) => <span key={k} className="rounded-full bg-brand-soft text-brand-ink px-3 py-1 text-sm">{tr(c)}</span>)}</div>}
            {s.items && <ul className="mt-4 grid gap-2">{s.items.map((x, k) => (
              <motion.li key={k} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.06 }} className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2">
                <span><span className="text-ink">{tr(x.t)}</span>{x.s && <span className="block text-xs text-muted">{tr(x.s)}</span>}</span>
                {x.badge && <span className="rounded-full bg-info-soft text-info px-2 py-0.5 text-xs">{tr(x.badge)}</span>}
              </motion.li>))}</ul>}
            <div className="mt-5 flex flex-wrap gap-2">{s.btns.map((bn, k) => (
              <button key={k} type="button" onClick={() => setI(bn.to)} className={`rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-focus ${k === 0 ? 'bg-brand text-on-brand hover:bg-brand-hover' : 'border border-line text-ink hover:bg-sunken'}`}>{tr(bn.l)}</button>))}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
