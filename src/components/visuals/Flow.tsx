'use client';
import { useMemo, useState } from 'react';
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Block } from '@/lib/schemas';
import { useApp } from '@/lib/i18n';

type F = Extract<Block, { kind: 'flow' }>;
export default function Flow({ b }: { b: F }) {
  const { tr, theme } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const nodes = useMemo<Node[]>(() => b.nodes.map((n) => ({
    id: n.key, position: { x: n.x, y: n.y }, data: { label: tr(n.label) }, draggable: false, selectable: true,
    style: { borderRadius: 14, border: `${sel === n.key ? 3 : 1.5}px solid ${sel === n.key ? 'var(--maroon)' : 'var(--line-strong)'}`, background: n.tone === 'start' ? 'var(--maroon)' : n.tone === 'warn' ? 'var(--danger-soft)' : 'var(--surface-raised)', color: n.tone === 'start' ? 'var(--on-maroon)' : 'var(--ink)', fontWeight: 600, padding: '10px 14px', minWidth: 120 },
  })), [b.nodes, tr, sel]);
  const edges = useMemo<Edge[]>(() => b.edges.map((e, i) => ({ id: `e${i}`, source: e.from, target: e.to, animated: true, label: e.label ? tr(e.label) : undefined, style: { stroke: 'var(--maroon)', strokeWidth: 2 }, labelStyle: { fill: 'var(--ink-muted)', fontSize: 12 }, labelBgStyle: { fill: 'var(--surface-raised)' } })), [b.edges, tr]);
  const node = b.nodes.find((n) => n.key === sel);
  return (
    <div>
      <div className="h-[320px] rounded-lg border border-line overflow-hidden bg-raised" role="img" aria-label={tr(b.alt)}>
        <ReactFlow nodes={nodes} edges={edges} fitView colorMode={theme} nodesConnectable={false} onNodeClick={(_, n) => setSel(sel === n.id ? null : n.id)} proOptions={{ hideAttribution: true }} minZoom={0.4}>
          <Background /><Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p aria-live="polite" className="mt-2 min-h-[2.5rem] text-sm text-muted">{node ? <><b className="text-ink">{tr(node.label)}:</b> {tr(node.text)}</> : tr(b.alt)}</p>
    </div>
  );
}
