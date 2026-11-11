'use client';
import { useId, useState } from 'react';
import { DIAGRAMS } from '@/lib/diagrams';
import { useApp } from '@/lib/i18n';

const W = 800, H = 300;
const px = (n: number) => (n / 100) * (W - 160) + 80;
const py = (n: number) => (n / 100) * (H - 90) + 45;

export function Diagram({ preset, focus = '' }: { preset: string; focus?: string }) {
  const { tr } = useApp();
  const d = DIAGRAMS[preset];
  const [sel, setSel] = useState<string | null>(null);
  const uid = useId().replace(/:/g, '');
  if (!d) return null;
  const active = focus || sel;
  const node = d.nodes.find((n) => n.k === active);
  const pos = (k: string) => { const n = d.nodes.find((x) => x.k === k)!; return [px(n.x), py(n.y)] as const; };
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={d.nodes.map((n) => tr(n.label)).join(' → ')}>
        <defs>
          <marker id={`ar${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)" /></marker>
        </defs>
        {d.edges.map((e, i) => {
          const [x1, y1] = pos(e.from), [x2, y2] = pos(e.to);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 18;
          const path = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
          const hot = active === e.from || active === e.to;
          return (
            <g key={i}>
              <path id={`p${uid}${i}`} d={path} fill="none" stroke={hot ? 'var(--maroon)' : 'var(--line-strong)'} strokeWidth={hot ? 3 : 2} markerEnd={`url(#ar${uid})`} opacity={hot || !active ? 1 : 0.35} />
              <circle r="5" fill="var(--maroon)" className="motion-reduce:hidden"><animateMotion dur={`${2.4 + (i % 3) * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`}><mpath href={`#p${uid}${i}`} /></animateMotion></circle>
              {e.label && <text x={mx} y={my - 4} textAnchor="middle" fontSize="13" fill="var(--ink-muted)">{tr(e.label)}</text>}
            </g>
          );
        })}
        {d.nodes.map((n) => {
          const x = px(n.x), y = py(n.y), on = active === n.k;
          const fill = n.tone === 'start' ? 'var(--maroon)' : n.tone === 'warn' ? 'var(--danger-soft)' : 'var(--surface-raised)';
          const ink = n.tone === 'start' ? 'var(--on-maroon)' : 'var(--ink)';
          return (
            <g key={n.k} tabIndex={0} role="button" aria-pressed={on} aria-label={tr(n.label)} onClick={() => setSel(sel === n.k ? null : n.k)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(sel === n.k ? null : n.k); } }} className="cursor-pointer outline-none [&:focus-visible_rect]:stroke-[3]" style={{ transition: 'transform .2s' }}>
              <rect x={x - 66} y={y - 26} width="132" height="52" rx="16" fill={fill} stroke={on ? 'var(--maroon)' : n.tone === 'end' ? 'var(--success-ink)' : 'var(--line-strong)'} strokeWidth={on ? 3 : 1.5} />
              <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill={ink}>{tr(n.label)}</text>
            </g>
          );
        })}
      </svg>
      <p aria-live="polite" className="min-h-[3rem] mt-2 text-sm text-muted">{node ? <><b className="text-ink">{tr(node.label)}:</b> {tr(node.text)}</> : '↑ ' + (tr({ id: 'Klik atau fokus sebuah kotak untuk detail.', en: 'Click or focus a box for details.' }))}</p>
    </div>
  );
}
