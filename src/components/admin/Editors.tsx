'use client';
import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react';
import { DIAGRAM_PRESETS, MOCK_PRESETS, type Bi, type Block } from '@/lib/schemas';
import { adminCall } from '@/lib/admin';

const inp = 'w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm';
export const Lbl = ({ t, children }: { t: string; children: ReactNode }) => <label className="grid gap-1 text-xs text-muted">{t}{children}</label>;
export function BiField({ label, v, on, area }: { label: string; v?: Bi; on: (b: Bi) => void; area?: boolean }) {
  const cur: Bi = v ?? { id: '' };
  const C = area ? 'textarea' : 'input';
  return (<div className="grid sm:grid-cols-2 gap-2"><Lbl t={`${label} (ID)`}><C className={inp} value={cur.id} onChange={(e) => on({ ...cur, id: e.target.value })} {...(area ? { rows: 3 } : {})} /></Lbl>
    <Lbl t={`${label} (EN)${cur.en ? '' : ' — kosong'}`}><C className={inp} value={cur.en ?? ''} onChange={(e) => on({ ...cur, en: e.target.value })} {...(area ? { rows: 3 } : {})} /></Lbl></div>);
}
function Rows<T>({ items, set, make, render, add }: { items: T[]; set: (x: T[]) => void; make: () => T; render: (x: T, up: (n: T) => void, i: number) => ReactNode; add: string }) {
  const mv = (i: number, d: number) => { const n = [...items]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set(n); };
  return (<div className="grid gap-2">{items.map((x, i) => (<div key={i} className="rounded-md border border-line p-2 grid gap-2 bg-sunken"><div className="flex justify-end gap-1">
    <button type="button" onClick={() => mv(i, -1)} aria-label="Naik" className="p-1"><ArrowUp size={14} /></button><button type="button" onClick={() => mv(i, 1)} aria-label="Turun" className="p-1"><ArrowDown size={14} /></button>
    <button type="button" onClick={() => set(items.filter((_, k) => k !== i))} aria-label="Hapus" className="p-1 text-danger"><Trash2 size={14} /></button></div>
    {render(x, (n) => set(items.map((y, k) => (k === i ? n : y))), i)}</div>))}
    <button type="button" onClick={() => set([...items, make()])} className="justify-self-start inline-flex items-center gap-1 text-sm text-brand"><Plus size={14} />{add}</button></div>);
}
const B = (id = ''): Bi => ({ id });
const Sel = ({ v, on, opts, label }: { v: string; on: (s: string) => void; opts: readonly string[]; label: string }) => <Lbl t={label}><select className={inp} value={v} onChange={(e) => on(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></Lbl>;
const Key = ({ v, on, label = 'Kunci' }: { v: string; on: (s: string) => void; label?: string }) => <Lbl t={label}><input className={inp} value={v} onChange={(e) => on(e.target.value.replace(/[^a-z0-9_-]/gi, ''))} /></Lbl>;

export const KIND_LABEL: Record<Block['kind'], string> = { heading: 'Judul bagian', text: 'Paragraf', list: 'Daftar', callout: 'Catatan', image: 'Gambar', video: 'Video', code: 'Kode', tabs: 'Tab', steps: 'Langkah interaktif', flow: 'Flowchart', mock: 'Simulasi UI', diagram: 'Diagram animasi', chart: 'Grafik', troubleshoot: 'Pohon masalah', scrolly: 'Scrollytelling', quiz: 'Kuis', compare: 'Tabel perbandingan', timeline: 'Linimasa' };
export function newBlock(kind: Block['kind']): Block {
  switch (kind) {
    case 'heading': return { kind, level: 2, text: B() };
    case 'text': return { kind, text: B() };
    case 'list': return { kind, ordered: false, items: [B()] };
    case 'callout': return { kind, tone: 'info', text: B() };
    case 'image': return { kind, url: '', alt: B() };
    case 'video': return { kind, url: '' };
    case 'code': return { kind, language: 'text', code: '' };
    case 'tabs': return { kind, tabs: [{ label: B(), text: B() }] };
    case 'steps': return { kind, steps: [{ title: B(), text: B() }, { title: B(), text: B() }] };
    case 'flow': return { kind, alt: B(), nodes: [{ key: 'a', label: B(), text: B(), x: 0, y: 0 }, { key: 'b', label: B(), text: B(), x: 260, y: 0 }], edges: [{ from: 'a', to: 'b' }] };
    case 'mock': return { kind, preset: 'login-akun' };
    case 'diagram': return { kind, preset: 'auth-flow' };
    case 'chart': return { kind, chart: 'bar', demo: true, points: [{ label: B('A'), value: 1 }, { label: B('B'), value: 2 }] };
    case 'troubleshoot': return { kind, start: 'a', nodes: [{ key: 'a', question: B(), answers: [{ label: B('Ya'), to: 'b' }] }, { key: 'b', result: B(), answers: [] }] };
    case 'scrolly': return { kind, preset: 'auth-flow', steps: [{ title: B(), text: B(), focus: '' }, { title: B(), text: B(), focus: '' }] };
    case 'quiz': return { kind, questions: [{ key: 'q1', text: B(), explanation: B(), options: [{ label: B(), correct: true }, { label: B(), correct: false }] }] };
    case 'compare': return { kind, columns: [B(), B()], rows: [{ label: B(), cells: [B(), B()] }] };
    case 'timeline': return { kind, events: [{ title: B(), text: B() }, { title: B(), text: B() }] };
  }
}

export function BlockEditor({ b, set }: { b: Block; set: (b: Block) => void }) {
  const [up, setUp] = useState('');
  async function upload(f: File) {
    setUp('…');
    try {
      if (f.size > 2 * 1024 * 1024) throw new Error('Maksimal 2 MB');
      const data = await new Promise<string>((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] ?? ''); r.onerror = no; r.readAsDataURL(f); });
      const j = await adminCall('upload_media', { mime: f.type, data, alt: f.name });
      if (b.kind === 'image') set({ ...b, url: j.url }); setUp('OK');
    } catch (e) { setUp((e as Error).message); }
  }
  switch (b.kind) {
    case 'heading': return <div className="grid gap-2"><Sel label="Tingkat" v={String(b.level)} opts={['2', '3']} on={(s) => set({ ...b, level: s === '3' ? 3 : 2 })} /><BiField label="Teks" v={b.text} on={(text) => set({ ...b, text })} /></div>;
    case 'text': return <BiField label="Teks" area v={b.text} on={(text) => set({ ...b, text })} />;
    case 'list': return <div className="grid gap-2"><label className="text-sm flex gap-2"><input type="checkbox" checked={b.ordered} onChange={(e) => set({ ...b, ordered: e.target.checked })} />Bernomor</label><Rows items={b.items} set={(items) => set({ ...b, items })} make={() => B()} add="Butir" render={(x, u) => <BiField label="Butir" v={x} on={u} />} /></div>;
    case 'callout': return <div className="grid gap-2"><Sel label="Nada" v={b.tone} opts={['info', 'tip', 'warning', 'draft', 'verified']} on={(s) => set({ ...b, tone: s as typeof b.tone })} /><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><BiField label="Isi" area v={b.text} on={(text) => set({ ...b, text })} /></div>;
    case 'image': return <div className="grid gap-2"><Lbl t="URL gambar (https:// atau /jalur)"><input className={inp} value={b.url} onChange={(e) => set({ ...b, url: e.target.value })} /></Lbl>
      <label className="inline-flex items-center gap-2 text-sm text-brand cursor-pointer"><Upload size={14} />Unggah (PNG/JPEG/WebP/GIF ≤ 2 MB)<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>{up && <span className="text-xs text-muted">{up}</span>}
      <BiField label="Teks alternatif" v={b.alt} on={(alt) => set({ ...b, alt })} /><BiField label="Keterangan" v={b.caption} on={(caption) => set({ ...b, caption })} /></div>;
    case 'video': return <div className="grid gap-2"><Lbl t="URL video"><input className={inp} value={b.url} onChange={(e) => set({ ...b, url: e.target.value })} /></Lbl><BiField label="Keterangan" v={b.caption} on={(caption) => set({ ...b, caption })} /></div>;
    case 'code': return <div className="grid gap-2"><Lbl t="Bahasa"><input className={inp} value={b.language} onChange={(e) => set({ ...b, language: e.target.value })} /></Lbl><Lbl t="Kode"><textarea rows={5} className={`${inp} font-mono`} value={b.code} onChange={(e) => set({ ...b, code: e.target.value })} /></Lbl></div>;
    case 'tabs': return <Rows items={b.tabs} set={(tabs) => set({ ...b, tabs })} make={() => ({ label: B(), text: B() })} add="Tab" render={(x, u) => <><BiField label="Label" v={x.label} on={(label) => u({ ...x, label })} /><BiField label="Isi" area v={x.text} on={(text) => u({ ...x, text })} /></>} />;
    case 'steps': return <div className="grid gap-2"><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><Rows items={b.steps} set={(steps) => set({ ...b, steps })} make={(): (typeof b.steps)[number] => ({ title: B(), text: B() })} add="Langkah" render={(x, u) => <><BiField label="Judul langkah" v={x.title} on={(title) => u({ ...x, title })} /><BiField label="Isi" area v={x.text} on={(text) => u({ ...x, text })} /><BiField label="Petunjuk (opsional)" v={x.hint} on={(hint) => u({ ...x, hint })} /></>} /></div>;
    case 'mock': return <div className="grid gap-2"><Sel label="Simulasi" v={b.preset} opts={MOCK_PRESETS} on={(s) => set({ ...b, preset: s as typeof b.preset })} /><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><BiField label="Keterangan" v={b.caption} on={(caption) => set({ ...b, caption })} /></div>;
    case 'diagram': return <div className="grid gap-2"><Sel label="Diagram" v={b.preset} opts={DIAGRAM_PRESETS} on={(s) => set({ ...b, preset: s as typeof b.preset })} /><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><BiField label="Keterangan" v={b.caption} on={(caption) => set({ ...b, caption })} /></div>;
    case 'chart': return <div className="grid gap-2"><Sel label="Jenis" v={b.chart} opts={['bar', 'line', 'pie']} on={(s) => set({ ...b, chart: s as typeof b.chart })} /><label className="text-sm flex gap-2"><input type="checkbox" checked={b.demo} onChange={(e) => set({ ...b, demo: e.target.checked })} />Data contoh/uji (ditandai DEMO)</label><Lbl t="Satuan"><input className={inp} value={b.unit ?? ''} onChange={(e) => set({ ...b, unit: e.target.value })} /></Lbl><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} />
      <Rows items={b.points} set={(points) => set({ ...b, points })} make={() => ({ label: B(), value: 0 })} add="Titik data" render={(x, u) => <><BiField label="Label" v={x.label} on={(label) => u({ ...x, label })} /><Lbl t="Nilai"><input type="number" className={inp} value={x.value} onChange={(e) => u({ ...x, value: Number(e.target.value) })} /></Lbl></>} /></div>;
    case 'flow': return <div className="grid gap-2"><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><BiField label="Deskripsi alternatif" v={b.alt} on={(alt) => set({ ...b, alt })} />
      <p className="text-xs font-semibold">Simpul</p><Rows items={b.nodes} set={(nodes) => set({ ...b, nodes })} make={() => ({ key: `n${b.nodes.length + 1}`, label: B(), text: B(), x: b.nodes.length * 240, y: 0 })} add="Simpul" render={(x, u) => <><div className="grid grid-cols-3 gap-2"><Key v={x.key} on={(key) => u({ ...x, key })} /><Lbl t="x"><input type="number" className={inp} value={x.x} onChange={(e) => u({ ...x, x: Number(e.target.value) })} /></Lbl><Lbl t="y"><input type="number" className={inp} value={x.y} onChange={(e) => u({ ...x, y: Number(e.target.value) })} /></Lbl></div><BiField label="Label" v={x.label} on={(label) => u({ ...x, label })} /><BiField label="Penjelasan" v={x.text} on={(text) => u({ ...x, text })} /></>} />
      <p className="text-xs font-semibold">Panah</p><Rows items={b.edges} set={(edges) => set({ ...b, edges })} make={() => ({ from: b.nodes[0]?.key ?? 'a', to: b.nodes[1]?.key ?? 'b' })} add="Panah" render={(x, u) => <div className="grid grid-cols-2 gap-2"><Sel label="Dari" v={x.from} opts={b.nodes.map((n) => n.key)} on={(from) => u({ ...x, from })} /><Sel label="Ke" v={x.to} opts={b.nodes.map((n) => n.key)} on={(to) => u({ ...x, to })} /></div>} /></div>;
    case 'troubleshoot': return <div className="grid gap-2"><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><Sel label="Simpul awal" v={b.start} opts={b.nodes.map((n) => n.key)} on={(start) => set({ ...b, start })} />
      <Rows items={b.nodes} set={(nodes) => set({ ...b, nodes })} make={() => ({ key: `n${b.nodes.length + 1}`, answers: [] })} add="Simpul" render={(x, u) => <><Key v={x.key} on={(key) => u({ ...x, key })} /><BiField label="Pertanyaan (kosongkan bila hasil)" v={x.question} on={(question) => u({ ...x, question })} /><BiField label="Hasil (untuk simpul akhir)" v={x.result} on={(result) => u({ ...x, result })} />
        <Rows items={x.answers} set={(answers) => u({ ...x, answers })} make={() => ({ label: B(), to: b.nodes[0]?.key ?? 'a' })} add="Jawaban" render={(a, ua) => <><BiField label="Jawaban" v={a.label} on={(label) => ua({ ...a, label })} /><Sel label="Menuju" v={a.to} opts={b.nodes.map((n) => n.key)} on={(to) => ua({ ...a, to })} /></>} /></>} /></div>;
    case 'scrolly': return <div className="grid gap-2"><Sel label="Diagram" v={b.preset} opts={DIAGRAM_PRESETS} on={(s) => set({ ...b, preset: s as typeof b.preset })} /><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><Rows items={b.steps} set={(steps) => set({ ...b, steps })} make={() => ({ title: B(), text: B(), focus: '' })} add="Langkah" render={(x, u) => <><Key label="Fokus (kunci simpul diagram)" v={x.focus} on={(focus) => u({ ...x, focus })} /><BiField label="Judul" v={x.title} on={(title) => u({ ...x, title })} /><BiField label="Isi" area v={x.text} on={(text) => u({ ...x, text })} /></>} /></div>;
    case 'quiz': return <div className="grid gap-2"><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><Rows items={b.questions} set={(questions) => set({ ...b, questions })} make={() => ({ key: `q${b.questions.length + 1}`, text: B(), explanation: B(), options: [{ label: B(), correct: true }, { label: B(), correct: false }] })} add="Pertanyaan" render={(q, uq) => <><Key v={q.key} on={(key) => uq({ ...q, key })} /><BiField label="Pertanyaan" v={q.text} on={(text) => uq({ ...q, text })} /><BiField label="Penjelasan" v={q.explanation} on={(explanation) => uq({ ...q, explanation })} />
      <Rows items={q.options} set={(options) => uq({ ...q, options })} make={() => ({ label: B(), correct: false })} add="Pilihan" render={(o, uo) => <><BiField label="Pilihan" v={o.label} on={(label) => uo({ ...o, label })} /><label className="text-sm flex gap-2"><input type="checkbox" checked={o.correct} onChange={(e) => uo({ ...o, correct: e.target.checked })} />Benar</label></>} /></>} /></div>;
    case 'compare': return <div className="grid gap-2"><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><p className="text-xs font-semibold">Kolom</p><Rows items={b.columns} set={(columns) => set({ ...b, columns, rows: b.rows.map((r) => ({ ...r, cells: columns.map((_, i) => r.cells[i] ?? B()) })) })} make={() => B()} add="Kolom" render={(x, u) => <BiField label="Kolom" v={x} on={u} />} />
      <p className="text-xs font-semibold">Baris</p><Rows items={b.rows} set={(rows) => set({ ...b, rows })} make={() => ({ label: B(), cells: b.columns.map(() => B()) })} add="Baris" render={(r, ur) => <><BiField label="Label baris" v={r.label} on={(label) => ur({ ...r, label })} />{b.columns.map((_, i) => <BiField key={i} label={`Sel ${i + 1}`} v={r.cells[i]} on={(c) => ur({ ...r, cells: b.columns.map((__, k) => (k === i ? c : r.cells[k] ?? B())) })} />)}</>} /></div>;
    case 'timeline': return <div className="grid gap-2"><BiField label="Judul" v={b.title} on={(title) => set({ ...b, title })} /><Rows items={b.events} set={(events) => set({ ...b, events })} make={(): (typeof b.events)[number] => ({ title: B(), text: B() })} add="Peristiwa" render={(x, u) => <><Lbl t="Waktu (opsional)"><input className={inp} value={x.time ?? ''} onChange={(e) => u({ ...x, time: e.target.value })} /></Lbl><BiField label="Judul" v={x.title} on={(title) => u({ ...x, title })} /><BiField label="Isi" v={x.text} on={(text) => u({ ...x, text })} /></>} /></div>;
  }
}
