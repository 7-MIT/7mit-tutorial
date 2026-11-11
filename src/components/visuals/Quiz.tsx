'use client';
import { useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';

type Q = Extract<Block, { kind: 'quiz' }>;
export function Quiz({ b }: { b: Q }) {
  const { tr, t } = useApp();
  const [ans, setAns] = useState<Record<string, number>>({});
  const done = Object.keys(ans).length === b.questions.length;
  const score = b.questions.filter((q) => q.options[ans[q.key]]?.correct).length;
  return (
    <div className="rounded-lg border border-line bg-raised p-5 shadow-card">
      {b.title && <h3 className="font-display text-lg mb-3">{tr(b.title)}</h3>}
      <div className="grid gap-5">
        {b.questions.map((q) => {
          const picked = ans[q.key];
          return (
            <fieldset key={q.key} disabled={picked !== undefined}>
              <legend className="font-medium mb-2">{tr(q.text)}</legend>
              <div className="grid gap-2">
                {q.options.map((o, i) => {
                  const show = picked !== undefined, mine = picked === i;
                  const cls = !show ? 'border-line hover:border-brand' : o.correct ? 'border-success bg-success-soft' : mine ? 'border-danger bg-danger-soft' : 'border-line opacity-60';
                  return (
                    <button key={i} type="button" onClick={() => setAns({ ...ans, [q.key]: i })} className={`flex items-center justify-between gap-2 text-left rounded-md border px-3 py-2 transition-colors ${cls}`}>
                      <span>{tr(o.label)}</span>
                      {show && (o.correct ? <CircleCheck size={18} className="text-success" aria-label={t('correct')} /> : mine ? <CircleX size={18} className="text-danger" aria-label={t('wrong')} /> : null)}
                    </button>
                  );
                })}
              </div>
              {picked !== undefined && <p role="status" className="mt-2 text-sm text-muted">{tr(q.explanation)}</p>}
            </fieldset>
          );
        })}
      </div>
      {done && <p role="status" className="mt-4 font-semibold">{score} / {b.questions.length}</p>}
      {Object.keys(ans).length > 0 && <button type="button" onClick={() => setAns({})} className="mt-3 text-sm text-muted hover:text-ink underline">{t('restart')}</button>}
    </div>
  );
}
