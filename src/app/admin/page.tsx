'use client';
import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, History, LogOut, MessageSquare, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/i18n';
import type { Article, Block, Category, Service } from '@/lib/schemas';
import { ApiError, adminCall, akunLogin, getToken, saveArticle, setToken, validateArticle } from '@/lib/admin';
import { BiField, BlockEditor, KIND_LABEL, Lbl, newBlock } from '@/components/admin/Editors';
import { Blocks } from '@/components/Blocks';
import { PageTitle } from '@/components/Cards';

type Data = { articles: (Article & { feedback?: { up: number; down: number } })[]; services: Service[]; categories: Category[]; me: { name: string; role: string; level: 'admin' | 'editor' } };
type Rev = { id: number; version: number; saved_at: string; saved_by: string; note: string; title_id: string; status: string };
type Fb = { id: number; slug: string; helpful: boolean; comment: string; lang: string; created_at: string; reviewed: boolean };
const inp = 'w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm';
const blank = (d: Data): Article => ({ id: '', slug: '', service: d.services[0]?.slug ?? 'akun', services: [], category: d.categories[0]?.slug ?? 'mulai', title: { id: '' }, summary: { id: '' }, status: 'draft', verified: false, featured: false, popular: false, minutes: 3, version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), author: '', blocks: [] });

function Login({ onDone }: { onDone: () => void }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [choose, setChoose] = useState<{ key: string; label: string }[] | null>(null); const [busy, setBusy] = useState(false);
  async function go(key = '') {
    setBusy(true); setErr('');
    try { const r = await akunLogin(u, p, key); setToken(r.token); setP(''); onDone(); }
    catch (e) {
      const x = e as ApiError; const pl = x.payload as { accounts?: { account_key: string; display_name?: string; role?: string; account_type?: string }[] } | undefined;
      if (x.status === 409 && pl?.accounts?.length) setChoose(pl.accounts.map((a) => ({ key: a.account_key, label: [a.display_name, a.role || a.account_type].filter(Boolean).join(' — ') })));
      else setErr(x.message || 'Gagal masuk.');
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); void go(); }} className="max-w-sm grid gap-3 rounded-lg border border-line bg-raised p-5">
      <p className="text-sm text-muted">Masuk dengan akun akun.7mit Anda. Hanya akun yang terdaftar sebagai staf yang dapat menyunting; server memeriksa ulang di setiap tindakan.</p>
      <Lbl t="Nama pengguna"><input className={inp} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" /></Lbl>
      <Lbl t="Kata sandi"><input className={inp} type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></Lbl>
      {choose && <div className="grid gap-1"><p className="text-sm">Pilih akun:</p>{choose.map((c) => <button key={c.key} type="button" onClick={() => go(c.key)} className="rounded-md border border-line px-3 py-2 text-left text-sm hover:bg-sunken">{c.label}</button>)}</div>}
      {err && <p role="alert" className="text-sm text-danger">{err}</p>}
      <button disabled={busy || !u || !p} className="rounded-full bg-brand text-on-brand px-4 py-2 disabled:opacity-50">{busy ? '…' : 'Masuk'}</button>
    </form>
  );
}

function Editor({ data, art, onSaved, onClose }: { data: Data; art: Article; onSaved: () => void; onClose: () => void }) {
  const { lang } = useApp();
  const [a, setA] = useState<Article>(art);
  const [note, setNote] = useState(''); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [prev, setPrev] = useState(true); const [busy, setBusy] = useState(false);
  const [revs, setRevs] = useState<Rev[] | null>(null); const [add, setAdd] = useState<Block['kind']>('steps');
  const isNew = !art.id;
  const set = <K extends keyof Article>(k: K, v: Article[K]) => setA((x) => ({ ...x, [k]: v }));
  const setBlock = (i: number, b: Block) => setA((x) => ({ ...x, blocks: x.blocks.map((y, k) => (k === i ? b : y)) }));
  const move = (i: number, d: number) => setA((x) => { const n = [...x.blocks]; const j = i + d; if (j < 0 || j >= n.length) return x; [n[i], n[j]] = [n[j], n[i]]; return { ...x, blocks: n }; });
  async function save(status: 'draft' | 'published') {
    const next = { ...a, status };
    const errs = validateArticle(next, status === 'published');
    if (errs.length) { setMsg({ ok: false, t: errs.join(' • ') }); return; }
    if (status === 'published' && data.me.level !== 'admin') { setMsg({ ok: false, t: 'Hanya admin yang boleh menerbitkan.' }); return; }
    setBusy(true);
    try { await saveArticle({ ...next, services: [...new Set([next.service, ...next.services])] }, note); setMsg({ ok: true, t: status === 'published' ? 'Diterbitkan.' : 'Draf disimpan.' }); setA(next); onSaved(); }
    catch (e) { setMsg({ ok: false, t: (e as Error).message }); } finally { setBusy(false); }
  }
  async function showRevs() { try { const r = await adminCall('revisions', { slug: a.slug }); setRevs(r.revisions); } catch (e) { setMsg({ ok: false, t: (e as Error).message }); } }
  async function restore(id: number) { if (!confirm('Pulihkan revisi ini? Isi saat ini disimpan sebagai revisi baru.')) return; try { await adminCall('restore_revision', { id }); setMsg({ ok: true, t: 'Revisi dipulihkan.' }); onSaved(); onClose(); } catch (e) { setMsg({ ok: false, t: (e as Error).message }); } }
  async function del() { if (!confirm('Hapus artikel ini secara permanen?')) return; try { await adminCall('delete_article', { slug: a.slug }); onSaved(); onClose(); } catch (e) { setMsg({ ok: false, t: (e as Error).message }); } }
  const en = a.blocks.length ? 'ok' : '';
  void en; void lang;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink">← Daftar</button><div className="flex-1" />
        <button type="button" onClick={() => setPrev(!prev)} className="inline-flex items-center gap-1 text-sm text-muted">{prev ? <EyeOff size={14} /> : <Eye size={14} />}Pratinjau</button>
        {!isNew && <button type="button" onClick={showRevs} className="inline-flex items-center gap-1 text-sm text-muted"><History size={14} />Revisi</button>}
        {!isNew && data.me.level === 'admin' && <button type="button" onClick={del} className="inline-flex items-center gap-1 text-sm text-danger"><Trash2 size={14} />Hapus</button>}</div>
      {msg && <p role="status" className={`rounded-md p-3 text-sm ${msg.ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>{msg.t}</p>}
      {revs && <div className="rounded-lg border border-line p-3 text-sm grid gap-1"><b>Revisi</b>{revs.length === 0 && <p className="text-muted">Belum ada.</p>}{revs.map((r) => <div key={r.id} className="flex items-center gap-3"><span className="flex-1">v{r.version} · {new Date(r.saved_at).toLocaleString('id-ID')} · {r.saved_by}{r.note ? ` · ${r.note}` : ''}</span>{data.me.level === 'admin' && <button type="button" onClick={() => restore(r.id)} className="text-brand underline">Pulihkan</button>}</div>)}</div>}
      <div className={`grid gap-6 ${prev ? 'xl:grid-cols-2' : ''}`}>
        <div className="grid gap-4 min-w-0">
          <div className="rounded-lg border border-line bg-raised p-4 grid gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Lbl t="Slug (alamat)"><input className={inp} value={a.slug} disabled={!isNew} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} /></Lbl>
              <Lbl t="Menit baca"><input type="number" min={1} max={120} className={inp} value={a.minutes} onChange={(e) => set('minutes', Math.max(1, Number(e.target.value)))} /></Lbl>
              <Lbl t="Layanan utama"><select className={inp} value={a.service} onChange={(e) => set('service', e.target.value)}>{data.services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></Lbl>
              <Lbl t="Kategori"><select className={inp} value={a.category} onChange={(e) => set('category', e.target.value)}>{data.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name.id}</option>)}</select></Lbl>
            </div>
            <BiField label="Judul" v={a.title} on={(v) => set('title', v)} /><BiField label="Ringkasan" area v={a.summary} on={(v) => set('summary', v)} />
            <div className="flex flex-wrap gap-4 text-sm">{(['verified', 'featured', 'popular'] as const).map((k) => <label key={k} className="flex gap-2"><input type="checkbox" checked={a[k]} onChange={(e) => set(k, e.target.checked)} />{k === 'verified' ? 'Terverifikasi' : k === 'featured' ? 'Pilihan' : 'Populer'}</label>)}</div>
          </div>
          {a.blocks.map((b, i) => (
            <div key={i} className="rounded-lg border border-line bg-raised p-4 grid gap-3">
              <div className="flex items-center gap-2"><b className="text-sm">{i + 1}. {KIND_LABEL[b.kind]}</b><div className="flex-1" />
                <button type="button" onClick={() => move(i, -1)} className="text-xs px-2">↑</button><button type="button" onClick={() => move(i, 1)} className="text-xs px-2">↓</button>
                <button type="button" onClick={() => set('blocks', a.blocks.filter((_, k) => k !== i))} className="text-danger" aria-label="Hapus blok"><Trash2 size={14} /></button></div>
              <BlockEditor b={b} set={(nb) => setBlock(i, nb)} />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2"><select aria-label="Jenis blok" className={inp + ' max-w-[14rem]'} value={add} onChange={(e) => setAdd(e.target.value as Block['kind'])}>{(Object.keys(KIND_LABEL) as Block['kind'][]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select>
            <button type="button" onClick={() => set('blocks', [...a.blocks, newBlock(add)])} className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm hover:bg-sunken"><Plus size={14} />Tambah blok</button></div>
          <div className="rounded-lg border border-line bg-raised p-4 grid gap-3"><Lbl t="Catatan revisi (opsional)"><input className={inp} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} /></Lbl>
            <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => save('draft')} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm"><Save size={14} />Simpan draf</button>
              <button type="button" disabled={busy || data.me.level !== 'admin'} onClick={() => save('published')} title={data.me.level !== 'admin' ? 'Hanya admin' : ''} className="inline-flex items-center gap-2 rounded-full bg-brand text-on-brand px-4 py-2 text-sm disabled:opacity-50"><Send size={14} />Terbitkan</button></div>
            <p className="text-xs text-muted">Menerbitkan mensyaratkan minimal satu visual interaktif. Artikel yang disimpan sebagai draf tidak tampil di situs publik.</p></div>
        </div>
        {prev && <div className="min-w-0"><div className="sticky top-20 max-h-[85vh] overflow-y-auto rounded-lg border border-line p-4"><p className="text-xs text-muted mb-3">Pratinjau</p><h2 className="font-display text-2xl mb-4">{a.title.id || '(tanpa judul)'}</h2><Blocks blocks={a.blocks} /></div></div>}
      </div>
    </div>
  );
}

function FeedbackTab() {
  const [fb, setFb] = useState<Fb[]>([]); const [err, setErr] = useState('');
  const load = useCallback(() => { adminCall('feedback_list').then((r) => setFb(r.feedback)).catch((e) => setErr(e.message)); }, []);
  useEffect(load, [load]);
  return (<div className="grid gap-2">{err && <p className="text-danger text-sm">{err}</p>}{fb.length === 0 && <p className="text-muted">Belum ada umpan balik.</p>}
    {fb.map((f) => <div key={f.id} className={`rounded-md border border-line p-3 text-sm flex gap-3 ${f.reviewed ? 'opacity-60' : ''}`}><span className={f.helpful ? 'text-success' : 'text-danger'}>{f.helpful ? '👍' : '👎'}</span><span className="flex-1"><b>{f.slug}</b> · {new Date(f.created_at).toLocaleString('id-ID')} · {f.lang}{f.comment && <span className="block mt-1">{f.comment}</span>}</span>
      <button type="button" onClick={() => adminCall('feedback_review', { id: f.id, reviewed: !f.reviewed }).then(load)} className="text-brand underline">{f.reviewed ? 'Buka lagi' : 'Tandai dibaca'}</button></div>)}</div>);
}

export default function Admin() {
  const { bundle } = useApp();
  const [state, setState] = useState<'check' | 'login' | 'denied' | 'ok'>('check');
  const [data, setData] = useState<Data | null>(null);
  const [edit, setEdit] = useState<Article | null>(null);
  const [tab, setTab] = useState<'articles' | 'feedback'>('articles');
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const load = useCallback(async () => {
    if (!getToken()) { setState('login'); return; }
    try { const r = await adminCall('admin_list'); setData(r as Data); setState('ok'); }
    catch (e) { const x = e as ApiError; if (x.status === 403) { setErr(x.message); setState('denied'); } else { setToken(''); setErr(x.status === 401 ? '' : x.message); setState('login'); } }
  }, []);
  useEffect(() => { void load(); }, [load]);
  void bundle;
  const out = () => { setToken(''); setData(null); setState('login'); };
  if (state === 'check') return <PageTitle title="Admin" sub="Memeriksa sesi…" />;
  if (state === 'login') return (<><PageTitle title="Admin" />{err && <p role="alert" className="mb-3 text-danger text-sm">{err}</p>}<Login onDone={load} /></>);
  if (state === 'denied') return (<><PageTitle title="Admin" /><p role="alert" className="rounded-md bg-danger-soft text-danger p-4">{err || 'Akun ini tidak punya akses.'}</p><button type="button" onClick={out} className="mt-4 underline">Keluar</button></>);
  if (!data) return null;
  if (edit) return <Editor data={data} art={edit} onSaved={load} onClose={() => setEdit(null)} />;
  const list = data.articles.filter((a) => !q || (a.title.id + a.slug).toLowerCase().includes(q.toLowerCase()));
  return (<>
    <PageTitle title="Admin" sub={`${data.me.name} · ${data.me.role} · ${data.me.level}`} />
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {(['articles', 'feedback'] as const).map((t) => <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm border inline-flex items-center gap-1 ${tab === t ? 'bg-brand text-on-brand border-brand' : 'border-line'}`}>{t === 'feedback' && <MessageSquare size={14} />}{t === 'articles' ? 'Artikel' : 'Umpan balik'}</button>)}
      <div className="flex-1" /><button type="button" onClick={out} className="inline-flex items-center gap-1 text-sm text-muted"><LogOut size={14} />Keluar</button></div>
    {tab === 'feedback' ? <FeedbackTab /> : <>
      <div className="flex gap-2 mb-4"><input className={inp} placeholder="Cari artikel…" aria-label="Cari artikel" value={q} onChange={(e) => setQ(e.target.value)} /><button type="button" onClick={() => setEdit(blank(data))} className="inline-flex items-center gap-1 rounded-full bg-brand text-on-brand px-4 py-2 text-sm whitespace-nowrap"><Plus size={14} />Artikel baru</button></div>
      <div className="grid gap-2">{list.map((a) => <button key={a.slug} type="button" onClick={() => setEdit(a)} className="text-left rounded-md border border-line bg-raised p-3 hover:border-brand flex flex-wrap items-center gap-3"><span className="flex-1 min-w-[14rem]"><b>{a.title.id}</b><span className="block text-xs text-muted">{a.slug} · v{a.version} · {a.service}</span></span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === 'published' ? 'bg-success-soft text-success' : 'bg-sunken text-muted'}`}>{a.status === 'published' ? 'Terbit' : 'Draf'}</span>
        <span className="text-xs text-muted">👍 {a.feedback?.up ?? 0} · 👎 {a.feedback?.down ?? 0}</span></button>)}</div></>}
  </>);
}
