'use client';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';

type C = Extract<Block, { kind: 'chart' }>;
const COLORS = ['#7a1424', '#c7694a', '#d9a441', '#2f7d5b', '#3867b0', '#8a6bbf'];
export default function Chart({ b }: { b: C }) {
  const { tr, lang } = useApp();
  const data = b.points.map((p) => ({ name: tr(p.label), value: p.value }));
  const fmt = (v: number) => (b.unit === 'Rp' ? 'Rp' + v.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID') : `${v.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}${b.unit ? ' ' + b.unit : ''}`);
  const tick = { fill: 'var(--ink-muted)', fontSize: 12 };
  return (
    <div className="rounded-lg border border-line bg-raised p-4 shadow-card">
      {b.title && <h3 className="font-display text-lg mb-2">{tr(b.title)}</h3>}
      <div className="h-64" role="img" aria-label={data.map((d) => `${d.name}: ${fmt(d.value)}`).join('; ')}>
        <ResponsiveContainer width="100%" height="100%">
          {b.chart === 'pie' ? (
            <PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={(e) => e.name}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => fmt(Number(v))} /></PieChart>
          ) : b.chart === 'line' ? (
            <LineChart data={data}><CartesianGrid stroke="var(--line)" /><XAxis dataKey="name" tick={tick} /><YAxis tick={tick} tickFormatter={fmt} width={80} /><Tooltip formatter={(v) => fmt(Number(v))} /><Line dataKey="value" stroke="#7a1424" strokeWidth={3} dot /></LineChart>
          ) : (
            <BarChart data={data}><CartesianGrid stroke="var(--line)" vertical={false} /><XAxis dataKey="name" tick={tick} /><YAxis tick={tick} tickFormatter={fmt} width={80} /><Tooltip formatter={(v) => fmt(Number(v))} cursor={{ fill: 'var(--surface-sunken)' }} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">{b.demo ? (lang === 'en' ? 'Demo data. ' : 'Data demo. ') : ''}{b.note ? tr(b.note) : ''}</p>
    </div>
  );
}
