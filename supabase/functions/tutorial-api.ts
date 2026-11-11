// @ts-nocheck
// tutorial-api — API Pusat Bantuan tutorial.7mit. Konten & umpan balik publik; penyuntingan hanya untuk staf (sesi akun 7 MIT + tabel staf).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
// Pemetaan antara model artikel bersarang (dipakai antarmuka) dan baris tabel datar kelas7mit_tutorial_*.
// Murni TypeScript tanpa impor: dipakai oleh edge function (Deno), skrip seed/snapshot (Node), dan pengujian.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Bi = { id: string; en?: string };
const bi = (id: any, en: any): Bi => ({ id: String(id ?? ''), ...(en ? { en: String(en) } : {}) });
const idOf = (v?: Bi) => v?.id ?? '';
const enOf = (v?: Bi) => v?.en ?? '';

export interface ItemRow { role: string; key?: string; parent_key?: string; label_id?: string; label_en?: string; text_id?: string; text_en?: string; hint_id?: string; hint_en?: string; flag?: boolean; num_a?: number; num_b?: number; target?: string }
export interface BlockRow { kind: string; title_id?: string; title_en?: string; text_id?: string; text_en?: string; note_id?: string; note_en?: string; variant?: string; tone?: string; url?: string; unit?: string; level?: number; flag?: boolean; extra?: string; items: ItemRow[] }

const item = (role: string, o: Partial<ItemRow> = {}): ItemRow => ({ role, ...o });
const L = (v?: Bi) => ({ label_id: idOf(v), label_en: enOf(v) });
const T = (v?: Bi) => ({ text_id: idOf(v), text_en: enOf(v) });

/** Blok bersarang -> baris blok + item. */
export function blockToRow(b: any): BlockRow {
  const r: BlockRow = { kind: b.kind, items: [] };
  const title = b.title as Bi | undefined;
  if (title) { r.title_id = idOf(title); r.title_en = enOf(title); }
  switch (b.kind) {
    case 'heading': r.level = b.level ?? 2; r.text_id = idOf(b.text); r.text_en = enOf(b.text); break;
    case 'text': r.text_id = idOf(b.text); r.text_en = enOf(b.text); break;
    case 'list': r.flag = !!b.ordered; r.items = b.items.map((x: Bi) => item('item', L(x))); break;
    case 'callout': r.tone = b.tone; r.text_id = idOf(b.text); r.text_en = enOf(b.text); break;
    case 'image': r.url = b.url; r.text_id = idOf(b.alt); r.text_en = enOf(b.alt); r.note_id = idOf(b.caption); r.note_en = enOf(b.caption); break;
    case 'video': r.url = b.url; r.note_id = idOf(b.caption); r.note_en = enOf(b.caption); break;
    case 'code': r.variant = b.language; r.text_id = b.code; break;
    case 'tabs': r.items = b.tabs.map((x: any) => item('tab', { ...L(x.label), ...T(x.text) })); break;
    case 'steps': r.items = b.steps.map((x: any) => item('step', { ...L(x.title), ...T(x.text), hint_id: idOf(x.hint), hint_en: enOf(x.hint) })); break;
    case 'flow':
      r.text_id = idOf(b.alt); r.text_en = enOf(b.alt);
      r.items = [
        ...b.nodes.map((n: any) => item('node', { key: n.key, ...L(n.label), ...T(n.text), num_a: n.x, num_b: n.y, target: n.tone ?? '' })),
        ...b.edges.map((e: any) => item('edge', { key: e.from, parent_key: e.to, ...L(e.label) })),
      ]; break;
    case 'mock': case 'diagram': r.variant = b.preset; r.note_id = idOf(b.caption); r.note_en = enOf(b.caption); break;
    case 'chart':
      r.variant = b.chart; r.flag = !!b.demo; r.unit = b.unit ?? ''; r.note_id = idOf(b.note); r.note_en = enOf(b.note);
      r.items = b.points.map((p: any) => item('point', { ...L(p.label), num_a: p.value })); break;
    case 'troubleshoot':
      r.extra = b.start;
      r.items = b.nodes.flatMap((n: any) => [
        item('node', { key: n.key, label_id: idOf(n.question), label_en: enOf(n.question), text_id: idOf(n.result), text_en: enOf(n.result), target: n.article ?? '' }),
        ...(n.answers ?? []).map((a: any) => item('answer', { parent_key: n.key, ...L(a.label), target: a.to })),
      ]); break;
    case 'scrolly': r.variant = b.preset; r.items = b.steps.map((s: any) => item('step', { ...L(s.title), ...T(s.text), target: s.focus ?? '' })); break;
    case 'quiz':
      r.items = b.questions.flatMap((q: any) => [
        item('question', { key: q.key, ...L(q.text), ...T(q.explanation) }),
        ...q.options.map((o: any) => item('option', { parent_key: q.key, ...L(o.label), flag: !!o.correct })),
      ]); break;
    case 'compare':
      r.items = [
        ...b.columns.map((c: Bi) => item('column', L(c))),
        ...b.rows.flatMap((row: any, i: number) => [item('row', { key: `r${i + 1}`, ...L(row.label) }), ...row.cells.map((c: Bi, j: number) => item('cell', { parent_key: `r${i + 1}`, ...L(c), num_a: j }))]),
      ]; break;
    case 'timeline': r.items = b.events.map((e: any) => item('event', { ...L(e.title), ...T(e.text), target: e.time ?? '' })); break;
    default: throw new Error('Jenis blok tidak dikenal: ' + b.kind);
  }
  return r;
}

const pick = (id?: string | null, en?: string | null): Bi => bi(id, en);

/** Baris blok + item -> blok bersarang. */
export function rowToBlock(r: any, items: any[]): any {
  const its = [...items].sort((a, b) => a.position - b.position);
  const of = (role: string) => its.filter((i) => i.role === role);
  const lab = (i: any) => pick(i.label_id, i.label_en);
  const txt = (i: any) => pick(i.text_id, i.text_en);
  const title = r.title_id || r.title_en ? { title: pick(r.title_id, r.title_en) } : {};
  switch (r.kind) {
    case 'heading': return { kind: 'heading', level: r.level === 3 ? 3 : 2, text: pick(r.text_id, r.text_en) };
    case 'text': return { kind: 'text', text: pick(r.text_id, r.text_en) };
    case 'list': return { kind: 'list', ordered: !!r.flag, items: of('item').map(lab) };
    case 'callout': return { kind: 'callout', tone: r.tone || 'info', ...title, text: pick(r.text_id, r.text_en) };
    case 'image': return { kind: 'image', url: r.url, alt: pick(r.text_id, r.text_en), ...(r.note_id ? { caption: pick(r.note_id, r.note_en) } : {}) };
    case 'video': return { kind: 'video', url: r.url, ...(r.note_id ? { caption: pick(r.note_id, r.note_en) } : {}) };
    case 'code': return { kind: 'code', language: r.variant || 'text', code: r.text_id };
    case 'tabs': return { kind: 'tabs', tabs: of('tab').map((i) => ({ label: lab(i), text: txt(i) })) };
    case 'steps': return { kind: 'steps', ...title, steps: of('step').map((i) => ({ title: lab(i), text: txt(i), ...(i.hint_id ? { hint: pick(i.hint_id, i.hint_en) } : {}) })) };
    case 'flow': return {
      kind: 'flow', ...title, alt: pick(r.text_id, r.text_en),
      nodes: of('node').map((i) => ({ key: i.key, label: lab(i), text: txt(i), x: i.num_a, y: i.num_b, ...(i.target ? { tone: i.target } : {}) })),
      edges: of('edge').map((i) => ({ from: i.key, to: i.parent_key, ...(i.label_id ? { label: lab(i) } : {}) })),
    };
    case 'mock': case 'diagram': return { kind: r.kind, preset: r.variant, ...title, ...(r.note_id ? { caption: pick(r.note_id, r.note_en) } : {}) };
    case 'chart': return { kind: 'chart', chart: r.variant || 'bar', ...title, demo: !!r.flag, ...(r.unit ? { unit: r.unit } : {}), points: of('point').map((i) => ({ label: lab(i), value: i.num_a })), ...(r.note_id ? { note: pick(r.note_id, r.note_en) } : {}) };
    case 'troubleshoot': return {
      kind: 'troubleshoot', ...title, start: r.extra,
      nodes: of('node').map((n) => ({
        key: n.key, ...(n.label_id ? { question: lab(n) } : {}), ...(n.text_id ? { result: txt(n) } : {}),
        answers: of('answer').filter((a) => a.parent_key === n.key).map((a) => ({ label: lab(a), to: a.target })), ...(n.target ? { article: n.target } : {}),
      })),
    };
    case 'scrolly': return { kind: 'scrolly', ...title, preset: r.variant, steps: of('step').map((i) => ({ title: lab(i), text: txt(i), focus: i.target || '' })) };
    case 'quiz': return {
      kind: 'quiz', ...title,
      questions: of('question').map((q) => ({ key: q.key, text: lab(q), explanation: txt(q), options: of('option').filter((o) => o.parent_key === q.key).map((o) => ({ label: lab(o), correct: !!o.flag })) })),
    };
    case 'compare': return {
      kind: 'compare', ...title, columns: of('column').map(lab),
      rows: of('row').map((row) => ({ label: lab(row), cells: of('cell').filter((c) => c.parent_key === row.key).sort((a, b) => a.num_a - b.num_a).map(lab) })),
    };
    case 'timeline': return { kind: 'timeline', ...title, events: of('event').map((i) => ({ title: lab(i), text: txt(i), ...(i.target ? { time: i.target } : {}) })) };
    default: return { kind: 'text', text: pick('', '') };
  }
}

/** Artikel bersarang -> muatan untuk fungsi tutorial_save_article. */
export function articleToPayload(a: any) {
  return {
    article: {
      slug: a.slug, service_slug: a.service, category_slug: a.category, title_id: idOf(a.title), title_en: enOf(a.title), summary_id: idOf(a.summary), summary_en: enOf(a.summary),
      status: a.status, verified: !!a.verified, featured: !!a.featured, popular: !!a.popular, minutes: a.minutes ?? 3,
      ...(a.createdAt ? { created_at: a.createdAt } : {}), ...(a.updatedAt ? { updated_at: a.updatedAt } : {}),
    },
    services: [...new Set([a.service, ...(a.services ?? [])])],
    blocks: a.blocks.map(blockToRow),
  };
}

/** Kumpulan baris tabel -> bundel konten bersarang. */
export function rowsToBundle(t: { services: any[]; categories: any[]; articles: any[]; article_services: any[]; blocks: any[]; items: any[] }) {
  const itemsByBlock = new Map<string, any[]>();
  for (const i of t.items) { const k = i.block_id; (itemsByBlock.get(k) ?? itemsByBlock.set(k, []).get(k)!).push(i); }
  const blocksByArticle = new Map<string, any[]>();
  for (const b of t.blocks) { (blocksByArticle.get(b.article_id) ?? blocksByArticle.set(b.article_id, []).get(b.article_id)!).push(b); }
  const svcByArticle = new Map<string, string[]>();
  for (const s of t.article_services) { (svcByArticle.get(s.article_id) ?? svcByArticle.set(s.article_id, []).get(s.article_id)!).push(s.service_slug); }
  return {
    generatedAt: new Date().toISOString(),
    categories: t.categories.map((c) => ({ slug: c.slug, name: pick(c.name_id, c.name_en), description: pick(c.description_id, c.description_en), icon: c.icon, sort: c.sort_order })),
    services: t.services.map((s) => ({
      slug: s.slug, name: s.name, host: s.host, url: s.url, category: s.category_slug, status: s.status, verified: !!s.verified, verifiedAt: s.verified_at ?? null, verifiedNote: s.verified_note ?? '',
      summary: pick(s.summary_id, s.summary_en), icon: s.icon, logoUrl: s.logo_url ?? '', legacy: !!s.legacy, sort: s.sort_order,
    })),
    articles: t.articles.map((a) => ({
      id: a.id, slug: a.slug, service: a.service_slug, services: svcByArticle.get(a.id) ?? [a.service_slug], category: a.category_slug,
      title: pick(a.title_id, a.title_en), summary: pick(a.summary_id, a.summary_en), status: a.status, verified: !!a.verified, featured: !!a.featured, popular: !!a.popular,
      minutes: a.minutes, version: a.version, createdAt: a.created_at, updatedAt: a.updated_at, author: a.author ?? '',
      blocks: (blocksByArticle.get(a.id) ?? []).sort((x, y) => x.position - y.position).map((b) => rowToBlock(b, itemsByBlock.get(b.id) ?? [])),
    })),
  };
}

export const serviceToRow = (s: any) => ({
  slug: s.slug, name: s.name, host: s.host ?? '', url: s.url ?? '', category_slug: s.category, status: s.status, verified: !!s.verified, verified_at: s.verifiedAt ?? null, verified_note: s.verifiedNote ?? '',
  summary_id: idOf(s.summary), summary_en: enOf(s.summary), icon: s.icon ?? 'globe', logo_url: s.logoUrl ?? '', legacy: !!s.legacy, sort_order: s.sort ?? 0, updated_at: new Date().toISOString(),
});
export const categoryToRow = (c: any) => ({ slug: c.slug, name_id: idOf(c.name), name_en: enOf(c.name), description_id: idOf(c.description), description_en: enOf(c.description), icon: c.icon ?? 'folder', sort_order: c.sort ?? 0, updated_at: new Date().toISOString() });

const U=Deno.env.get("SUPABASE_URL")||"",K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-7mit-session","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const j=(x,s=200,cache="no-store")=>new Response(JSON.stringify(x),{status:s,headers:{...cors,"Cache-Control":cache,"Content-Type":"application/json; charset=utf-8"}});
const bad=(m,s=400)=>j({ok:false,message:m},s);
const c=(v,n=300)=>String(v??"").trim().slice(0,n);
const VISUAL=new Set(["steps","flow","mock","diagram","chart","troubleshoot","scrolly","quiz"]);
const KINDS=new Set(["heading","text","list","callout","image","video","code","tabs","steps","flow","mock","diagram","chart","troubleshoot","scrolly","quiz","compare","timeline"]);
const fail=(m,s=400)=>Object.assign(new Error(m),{status:s});

async function me(req){
  const t=c(req.headers.get("x-7mit-session"),100);
  if(!t)throw fail("Sesi tidak tersedia.",401);
  const {data:s}=await db.from("chat_user_sessions_v4").select("account_key").eq("token",t).eq("revoked",false).maybeSingle();
  if(!s?.account_key)throw fail("Sesi tidak valid.",401);
  const {data:a}=await db.from("portal_login_accounts").select("account_key,username,display_name,role,account_type,active").eq("account_key",s.account_key).eq("active",true).maybeSingle();
  if(!a)throw fail("Akun tidak tersedia.",401);
  const {data:staff}=await db.from("kelas7mit_tutorial_staff").select("account_type,role_pattern,level").eq("account_type",a.account_type);
  const re=p=>new RegExp("^"+p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/%/g,".*")+"$","i");
  const m=(staff||[]).filter(x=>re(x.role_pattern).test(a.role||""));
  if(!m.length)throw fail("Akun ini tidak punya akses penyuntingan.",403);
  return{...a,level:m.some(x=>x.level==="admin")?"admin":"editor"};
}
const who=a=>`${a.display_name} (${a.role})`;

async function loadBundle(onlyPublished){
  const q=async(t,sel="*")=>{const {data,error}=await db.from(t).select(sel).limit(10000);if(error)throw fail("Konten gagal dimuat.",500);return data||[]};
  const [services,categories,articles0,article_services,blocks,items]=await Promise.all([q("kelas7mit_tutorial_services"),q("kelas7mit_tutorial_categories"),q("kelas7mit_tutorial_articles"),q("kelas7mit_tutorial_article_services"),q("kelas7mit_tutorial_blocks"),q("kelas7mit_tutorial_block_items")]);
  const articles=onlyPublished?articles0.filter(a=>a.status==="published"):articles0;
  const ids=new Set(articles.map(a=>a.id));
  const bl=blocks.filter(b=>ids.has(b.article_id)),bids=new Set(bl.map(b=>b.id));
  return rowsToBundle({services,categories,articles,article_services:article_services.filter(s=>ids.has(s.article_id)),blocks:bl,items:items.filter(i=>bids.has(i.block_id))});
}

function validate(p,publish){
  const a=p?.article;
  if(!a||!/^[a-z0-9-]{3,90}$/.test(a.slug||""))throw fail("Slug tidak valid (huruf kecil, angka, tanda hubung, 3–90).");
  if(!c(a.title_id))throw fail("Judul (Indonesia) wajib diisi.");
  if(!Array.isArray(p.blocks)||!p.blocks.length)throw fail("Artikel harus punya minimal satu blok.");
  if(p.blocks.length>80)throw fail("Terlalu banyak blok (maksimal 80).");
  for(const b of p.blocks){
    if(!KINDS.has(b.kind))throw fail("Jenis blok tidak dikenal: "+c(b.kind,30));
    if(!Array.isArray(b.items))b.items=[];
    if(b.items.length>300)throw fail("Terlalu banyak item dalam satu blok.");
    if(b.kind==="image"||b.kind==="video"){if(!/^(https:\/\/|\/)/.test(b.url||""))throw fail("URL media harus https:// atau jalur lokal.")}
  }
  if(publish&&!p.blocks.some(b=>VISUAL.has(b.kind)))throw fail("Artikel terbit wajib punya minimal satu visual interaktif (langkah, diagram, simulasi, grafik, pohon masalah, scrolly, atau kuis).");
}

async function saveArticle(a,b){
  const p=b.payload;validate(p,p?.article?.status==="published");
  if(p.article.status==="published"&&a.level!=="admin")throw fail("Hanya admin yang boleh menerbitkan.",403);
  const {data,error}=await db.rpc("tutorial_save_article",{p,p_by:who(a),p_note:c(b.note,200)});
  if(error){console.error("save",error);throw fail("Artikel gagal disimpan: "+c(error.message,160),400)}
  return data;
}

Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const url=new URL(req.url);
    if(req.method==="GET"){
      const r=url.searchParams.get("r")||"content";
      if(r==="content")return j({ok:true,...await loadBundle(true)},200,"public, max-age=60");
      return bad("Sumber tidak dikenal.",404);
    }
    if(req.method!=="POST")return bad("Metode tidak didukung.",405);
    const b=await req.json().catch(()=>({})),action=c(b.action,40);
    if(action==="feedback"){
      const slug=c(b.slug,90),helpful=b.helpful===true;
      const {data:art}=await db.from("kelas7mit_tutorial_articles").select("id").eq("slug",slug).eq("status","published").maybeSingle();
      if(!art)return bad("Artikel tidak ditemukan.",404);
      const ip=c(req.headers.get("x-forwarded-for")||"",60);
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+"|"+slug)))).slice(0,8).map(x=>x.toString(16).padStart(2,"0")).join("");
      const since=new Date(Date.now()-3600*1000).toISOString();
      const {count}=await db.from("kelas7mit_tutorial_feedback").select("id",{head:true,count:"exact"}).eq("client_hash",hash).gte("created_at",since);
      if((count||0)>=5)return bad("Terlalu sering. Coba lagi nanti.",429);
      const {error}=await db.from("kelas7mit_tutorial_feedback").insert({article_id:art.id,slug,helpful,comment:c(b.comment,1000),lang:b.lang==="en"?"en":"id",client_hash:hash});
      if(error)throw fail("Umpan balik gagal disimpan.",500);
      return j({ok:true});
    }
    const a=await me(req);
    if(action==="me")return j({ok:true,name:a.display_name,role:a.role,level:a.level});
    if(action==="admin_list"){
      const bundle=await loadBundle(false);
      const {data:fb}=await db.from("kelas7mit_tutorial_feedback").select("article_id,helpful").limit(10000);
      const agg={};for(const f of fb||[]){const o=agg[f.article_id]??(agg[f.article_id]={up:0,down:0});f.helpful?o.up++:o.down++}
      bundle.articles=bundle.articles.map(x=>({...x,feedback:agg[x.id]||{up:0,down:0}}));
      return j({ok:true,...bundle,me:{name:a.display_name,role:a.role,level:a.level}});
    }
    if(action==="save_article")return j({ok:true,result:await saveArticle(a,b)});
    if(action==="delete_article"){
      if(a.level!=="admin")throw fail("Hanya admin yang boleh menghapus.",403);
      const {error}=await db.from("kelas7mit_tutorial_articles").delete().eq("slug",c(b.slug,90));
      if(error)throw fail("Artikel gagal dihapus.",500);return j({ok:true});
    }
    if(action==="revisions"){
      const {data:art}=await db.from("kelas7mit_tutorial_articles").select("id").eq("slug",c(b.slug,90)).maybeSingle();
      if(!art)return bad("Artikel tidak ditemukan.",404);
      const {data}=await db.from("kelas7mit_tutorial_revisions").select("id,version,saved_at,saved_by,note,title_id,status").eq("article_id",art.id).order("id",{ascending:false}).limit(50);
      return j({ok:true,revisions:data||[]});
    }
    if(action==="restore_revision"){
      if(a.level!=="admin")throw fail("Hanya admin yang boleh memulihkan revisi.",403);
      const {data,error}=await db.rpc("tutorial_restore_revision",{p_revision:Number(b.id),p_by:who(a)});
      if(error)throw fail("Revisi gagal dipulihkan: "+c(error.message,160));return j({ok:true,result:data});
    }
    if(action==="feedback_list"){
      const {data}=await db.from("kelas7mit_tutorial_feedback").select("id,slug,helpful,comment,lang,created_at,reviewed").order("id",{ascending:false}).limit(200);
      return j({ok:true,feedback:data||[]});
    }
    if(action==="feedback_review"){
      const {error}=await db.from("kelas7mit_tutorial_feedback").update({reviewed:b.reviewed!==false}).eq("id",Number(b.id));
      if(error)throw fail("Gagal memperbarui.",500);return j({ok:true});
    }
    if(action==="upsert_service"){
      if(a.level!=="admin")throw fail("Hanya admin yang boleh mengubah layanan.",403);
      const s=b.service||{};if(!/^[a-z0-9-]{2,40}$/.test(s.slug||""))throw fail("Slug layanan tidak valid.");
      const row=serviceToRow(s);
      const {error}=await db.from("kelas7mit_tutorial_services").upsert(row,{onConflict:"slug"});
      if(error)throw fail("Layanan gagal disimpan: "+c(error.message,120));return j({ok:true});
    }
    if(action==="upload_media"){
      const mime=c(b.mime,60),ok=["image/png","image/jpeg","image/webp","image/gif"];
      if(!ok.includes(mime))throw fail("Hanya gambar PNG, JPEG, WebP, atau GIF.");
      const bin=Uint8Array.from(atob(String(b.data||"")),ch=>ch.charCodeAt(0));
      if(bin.length>2*1024*1024)throw fail("Ukuran gambar maksimal 2 MB.");
      const ext=mime.split("/")[1].replace("jpeg","jpg"),path=`${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const up=await db.storage.from("tutorial-media").upload(path,bin,{contentType:mime,upsert:false});
      if(up.error)throw fail("Unggahan gagal: "+c(up.error.message,120),500);
      const pub=db.storage.from("tutorial-media").getPublicUrl(path).data.publicUrl;
      await db.from("kelas7mit_tutorial_media").insert({path,url:pub,mime,size_bytes:bin.length,alt:c(b.alt,200),uploaded_by:who(a)});
      return j({ok:true,url:pub});
    }
    return bad("Aksi tidak dikenal.");
  }catch(e){console.error("tutorial-api",e);return bad(String(e?.message||"Permintaan gagal diproses."),Number(e?.status||400))}
});
