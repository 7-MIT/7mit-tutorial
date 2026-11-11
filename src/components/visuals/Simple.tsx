'use client';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';

export function Compare({ b }: { b: Extract<Block, { kind: 'compare' }> }) {
  const { tr } = useApp();
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      {b.title && <h3 className="font-display text-lg p-3">{tr(b.title)}</h3>}
      <table className="w-full text-sm"><thead className="bg-sunken"><tr><th className="p-2" />{b.columns.map((c, i) => <th key={i} className="p-2 text-left">{tr(c)}</th>)}</tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-line"><th scope="row" className="p-2 text-left font-medium">{tr(r.label)}</th>{r.cells.map((c, j) => <td key={j} className="p-2">{tr(c)}</td>)}</tr>)}</tbody></table>
    </div>
  );
}
export function Timeline({ b }: { b: Extract<Block, { kind: 'timeline' }> }) {
  const { tr } = useApp();
  return (
    <div>
      {b.title && <h3 className="font-display text-lg mb-3">{tr(b.title)}</h3>}
      <ol className="relative border-l-2 border-line ml-2 grid gap-5">
        {b.events.map((e, i) => (
          <li key={i} className="pl-5 relative"><span className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-brand border-2 border-surface" aria-hidden />
            {e.time && <p className="text-xs text-muted">{e.time}</p>}<h4 className="font-semibold">{tr(e.title)}</h4><p className="text-muted">{tr(e.text)}</p></li>
        ))}
      </ol>
    </div>
  );
}
