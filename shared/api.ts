// @ts-nocheck
// tutorial-api — API Pusat Bantuan tutorial.7mit. Konten & umpan balik publik; penyuntingan hanya untuk staf (sesi akun 7 MIT + tabel staf).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
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
