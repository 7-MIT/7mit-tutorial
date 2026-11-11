'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Bot, Copy, Download, RefreshCw, Send, Square, Trash2, User } from 'lucide-react';
import { useApp } from '@/lib/i18n';
import { useSearch } from '@/components/Search';
import { Blocks } from '@/components/Blocks';
import { PageTitle } from '@/components/Cards';
import { retrieve, systemPrompt, fallbackAnswer } from '@/lib/ai/rag';
import { pickComponents, toBlock } from '@/lib/ai/generative';
import { AiResponse, type AiComponent } from '@/lib/schemas';
import { tr as trx } from '@/lib/content';

type Msg = { id: number; role: 'user' | 'ai'; text: string; res?: AiResponse; pending?: boolean; mode?: 'model' | 'search' };
type Phase = 'idle' | 'loading' | 'ready' | 'unsupported' | 'error';
const HKEY = 't7-ai-history';
const MB = (n: number) => (n / 1048576).toFixed(0);

function Inner() {
  const { lang, bundle, t } = useApp();
  const ms = useSearch();
  const sp = useSearchParams();
  const pinned = sp.get('article') ?? undefined;
  const pinnedArt = bundle.articles.find((a) => a.slug === pinned);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [prog, setProg] = useState({ loaded: 0, total: 0 });
  const [busy, setBusy] = useState(false);
  const worker = useRef<Worker | null>(null);
  const seq = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<{ id: number; q: string; r: ReturnType<typeof retrieve> } | null>(null);
  const L = (id: string, en: string) => (lang === 'en' ? en : id);

  useEffect(() => { try { const h = JSON.parse(localStorage.getItem(HKEY) || '[]'); if (Array.isArray(h)) { setMsgs(h); seq.current = h.reduce((m: number, x: Msg) => Math.max(m, x.id), 0) + 1; } } catch { /* abaikan */ } }, []);
  useEffect(() => { try { localStorage.setItem(HKEY, JSON.stringify(msgs.filter((m) => !m.pending).slice(-30))); } catch { /* abaikan */ } endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs]);
  useEffect(() => () => worker.current?.terminate(), []);

  const finish = useCallback((id: number, text: string, r: ReturnType<typeof retrieve>, q: string, mode: 'model' | 'search') => {
    const comps = pickComponents(q, r.articles, bundle.services, lang);
    const follow = r.articles.slice(0, 3).flatMap((a) => [trx(a.title, lang)]).slice(0, 3).map((x) => (lang === 'en' ? `Tell me more: ${x}` : `Jelaskan lebih lanjut: ${x}`));
    const parsed = AiResponse.safeParse({ answer: text, components: comps, followups: follow, sources: r.sources, grounded: r.articles.length > 0 });
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text, pending: false, mode, res: parsed.success ? parsed.data : { answer: text, components: [], followups: [], sources: r.sources, grounded: r.articles.length > 0 } } : x)));
    setBusy(false);
  }, [bundle.services, lang]);

  const ensureWorker = useCallback(() => {
    if (worker.current) return worker.current;
    const w = new Worker(new URL('../../lib/ai/worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent) => {
      const m = ev.data;
      if (m.type === 'progress') setProg({ loaded: m.loaded, total: m.total });
      else if (m.type === 'ready') setPhase('ready');
      else if (m.type === 'error') {
        if (m.code === 'webgpu') setPhase('unsupported'); else if (m.code === 'load') setPhase('error');
        const p = pendingRef.current;
        if (p && (m.code === 'gen' || m.code === 'notready')) finish(p.id, fallbackAnswer(p.r, lang), p.r, p.q, 'search');
      } else if (m.type === 'token') setMsgs((x) => x.map((y) => (y.id === m.id ? { ...y, text: m.text } : y)));
      else if (m.type === 'done') { const p = pendingRef.current; if (p) finish(p.id, m.text || fallbackAnswer(p.r, lang), p.r, p.q, m.text ? 'model' : 'search'); }
    };
    worker.current = w;
    return w;
  }, [finish, lang]);

  const load = () => { setPhase('loading'); ensureWorker().postMessage({ type: 'load' }); };

  const ask = useCallback((q: string, replaceId?: number) => {
    if (!q.trim() || busy) return;
    const r = retrieve(ms, q, bundle.articles, bundle.services, lang, pinned);
    const id = seq.current++;
    setBusy(true);
    setMsgs((m) => { const base = replaceId ? m.slice(0, m.findIndex((x) => x.id === replaceId)) : m; return [...base, ...(replaceId ? [] : [{ id: id - 0.5, role: 'user' as const, text: q }]), { id, role: 'ai' as const, text: '', pending: true }]; });
    pendingRef.current = { id, q, r };
    if (phase === 'ready' && worker.current && r.articles.length) {
      const history = msgs.filter((x) => !x.pending).slice(-4).map((x) => ({ role: x.role === 'user' ? 'user' : 'assistant', content: x.text }));
      worker.current.postMessage({ type: 'generate', id, messages: [{ role: 'system', content: systemPrompt(lang, r.context) }, ...history, { role: 'user', content: q + ' /no_think' }] });
    } else {
      setTimeout(() => finish(id, fallbackAnswer(r, lang), r, q, 'search'), 250);
    }
  }, [busy, ms, bundle.articles, bundle.services, lang, pinned, phase, msgs, finish]);

  const send = () => { const q = input.trim(); setInput(''); ask(q); };
  const regenerate = (id: number) => { const i = msgs.findIndex((x) => x.id === id); const u = msgs[i - 1]; if (u?.role === 'user') ask(u.text, id); };
  const stop = () => { worker.current?.postMessage({ type: 'stop' }); };
  const copy = (txt: string) => { try { void navigator.clipboard.writeText(txt); } catch { /* abaikan */ } };
  const clear = () => { setMsgs([]); try { localStorage.removeItem(HKEY); } catch { /* abaikan */ } };
  const suggestions = useMemo(() => (lang === 'en' ? ['How do I sign in?', 'I forgot my password', 'What is OneClass?', 'Compare akun and OneClass'] : ['Bagaimana cara masuk?', 'Saya lupa kata sandi', 'Apa itu OneClass?', 'Bandingkan akun dan OneClass']), [lang]);

  return (<>
    <PageTitle title="7 MIT Help AI" sub={L('Asisten lokal yang menjawab dari artikel pusat bantuan. Model berjalan di peramban Anda; pertanyaan tidak dikirim ke server.', 'A local assistant that answers from the help articles. The model runs in your browser; your questions are not sent to a server.')} />
    <div className="rounded-lg border border-line bg-raised p-4 mb-4 text-sm" role="region" aria-label="Model">
      {phase === 'idle' && <div className="flex flex-wrap items-center gap-3"><span className="flex-1 min-w-[14rem] text-muted">{L('Mode saat ini: pencarian artikel (tanpa model). Model Qwen3-0.6B (±570 MB, butuh WebGPU) bisa diunduh sekali untuk jawaban yang lebih alami.', 'Current mode: article search (no model). The Qwen3-0.6B model (~570 MB, needs WebGPU) can be downloaded once for more natural answers.')}</span><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-full bg-brand text-on-brand px-4 py-2"><Download size={16} aria-hidden />{L('Unduh & aktifkan model', 'Download & enable model')}</button></div>}
      {phase === 'loading' && <div><p>{L('Memuat model…', 'Loading model…')} {prog.total ? `${MB(prog.loaded)} / ${MB(prog.total)} MB` : ''}</p><div className="mt-2 h-2 rounded-full bg-sunken overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prog.total ? Math.round((prog.loaded / prog.total) * 100) : 0}><div className="h-full bg-brand transition-all" style={{ width: `${prog.total ? (prog.loaded / prog.total) * 100 : 3}%` }} /></div></div>}
      {phase === 'ready' && <p className="text-success flex items-center gap-2"><Bot size={16} aria-hidden />{L('Model aktif (berjalan di perangkat ini).', 'Model active (running on this device).')}</p>}
      {(phase === 'unsupported' || phase === 'error') && <p className="flex gap-2 text-warning"><AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden />{phase === 'unsupported' ? L('Peramban ini belum mendukung WebGPU, jadi model tidak bisa dijalankan. Pencarian artikel tetap berfungsi.', 'This browser does not support WebGPU, so the model cannot run. Article search still works.') : L('Model gagal dimuat. Pencarian artikel tetap berfungsi.', 'The model failed to load. Article search still works.')}</p>}
      {pinnedArt && <p className="mt-2 text-muted">{L('Konteks artikel', 'Article context')}: <Link href={`/help/article/${pinnedArt.slug}/`} className="text-brand underline">{trx(pinnedArt.title, lang)}</Link></p>}
    </div>
    <div className="grid gap-4 min-h-[40vh]" aria-live="polite">
      {msgs.length === 0 && <div className="flex flex-wrap gap-2">{suggestions.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-line px-4 py-2 text-sm hover:bg-sunken">{s}</button>)}</div>}
      {msgs.map((m) => m.role === 'user' ? (
        <div key={m.id} className="flex justify-end gap-2"><p className="rounded-lg bg-brand text-on-brand px-4 py-2 max-w-[85%] whitespace-pre-wrap">{m.text}</p><User size={18} className="mt-2 text-muted" aria-hidden /></div>
      ) : (
        <div key={m.id} className="flex gap-2"><Bot size={18} className="mt-2 text-brand shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 grid gap-3">
            <div className="rounded-lg border border-line bg-raised px-4 py-3 whitespace-pre-wrap">{m.text || (m.pending ? <span className="text-muted animate-pulse">{L('Berpikir…', 'Thinking…')}</span> : '')}</div>
            {m.res && m.res.components.map((c: AiComponent, i: number) => { const b = toBlock(c); return b ? <Blocks key={i} blocks={[b]} /> : null; })}
            {m.res && m.res.sources.length > 0 && <p className="text-sm text-muted">{L('Sumber', 'Sources')}: {m.res.sources.map((s, i) => <span key={s.slug}>{i > 0 && ', '}<Link href={`/help/article/${s.slug}/`} className="text-brand underline">{s.title}</Link></span>)}</p>}
            {m.res && !m.res.grounded && <p className="text-sm text-warning">{L('Tidak ada artikel yang cocok; jawaban ini tidak berdasarkan sumber.', 'No matching article; this answer is not grounded in a source.')}</p>}
            {m.mode === 'search' && !m.pending && <p className="text-xs text-muted">{L('Dijawab dari pencarian artikel (tanpa model).', 'Answered from article search (no model).')}</p>}
            {!m.pending && <div className="flex flex-wrap items-center gap-2 text-sm">
              <button type="button" onClick={() => copy(m.text)} className="inline-flex items-center gap-1 text-muted hover:text-ink"><Copy size={14} aria-hidden />{L('Salin', 'Copy')}</button>
              <button type="button" onClick={() => regenerate(m.id)} disabled={busy} className="inline-flex items-center gap-1 text-muted hover:text-ink disabled:opacity-40"><RefreshCw size={14} aria-hidden />{L('Ulangi', 'Regenerate')}</button>
              {m.res?.followups.map((f) => <button key={f} type="button" onClick={() => ask(f)} disabled={busy} className="rounded-full border border-line px-3 py-1 hover:bg-sunken disabled:opacity-40">{f}</button>)}
            </div>}
          </div></div>
      ))}
      <div ref={endRef} />
    </div>
    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="sticky bottom-4 mt-6 flex items-center gap-2 rounded-full border border-line bg-raised px-4 shadow-card">
      <label htmlFor="ai-q" className="sr-only">{t('ai')}</label>
      <input id="ai-q" value={input} onChange={(e) => setInput(e.target.value)} placeholder={L('Tanya tentang layanan 7 MIT…', 'Ask about 7 MIT services…')} className="flex-1 bg-transparent py-3 outline-none" autoComplete="off" />
      {msgs.length > 0 && <button type="button" onClick={clear} className="p-2 text-muted hover:text-ink" aria-label={L('Hapus riwayat', 'Clear history')}><Trash2 size={18} /></button>}
      {busy && phase === 'ready' ? <button type="button" onClick={stop} className="p-2 text-brand" aria-label="Stop"><Square size={18} /></button> : <button type="submit" disabled={busy || !input.trim()} className="p-2 text-brand disabled:opacity-40" aria-label={L('Kirim', 'Send')}><Send size={18} /></button>}
    </form>
  </>);
}
export default function AiPage() { return <Suspense fallback={null}><Inner /></Suspense>; }
