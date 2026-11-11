'use client';
import { useEffect, useRef, useState } from 'react';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';
import { Diagram } from './Diagram';

type S = Extract<Block, { kind: 'scrolly' }>;
export function Scrolly({ b }: { b: S }) {
  const { tr } = useApp();
  const [i, setI] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setI(Number((e.target as HTMLElement).dataset.i)); }, { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [b.steps.length]);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="md:sticky md:top-24 self-start rounded-lg border border-line bg-raised p-3 shadow-card">
        {b.title && <h3 className="font-display text-lg px-2">{tr(b.title)}</h3>}
        <Diagram preset={b.preset} focus={b.steps[i]?.focus || ''} />
      </div>
      <ol className="grid gap-[22vh] py-[8vh]">
        {b.steps.map((s, k) => (
          <li key={k} data-i={k} ref={(el) => { refs.current[k] = el; }} className={`rounded-lg border p-4 transition-all ${k === i ? 'border-brand bg-raised shadow-card opacity-100' : 'border-line opacity-60'}`}>
            <p className="text-xs text-muted">{k + 1} / {b.steps.length}</p>
            <h4 className="font-display text-lg">{tr(s.title)}</h4><p className="mt-1">{tr(s.text)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
