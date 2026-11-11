-- tutorial.7mit — Pusat Bantuan. Semua data pakai kolom biasa (tanpa JSON); jsonb hanya sebagai pembawa data antar fungsi.
create table if not exists public.kelas7mit_tutorial_categories(
  slug text primary key, name_id text not null, name_en text not null default '', description_id text not null default '', description_en text not null default '',
  icon text not null default 'folder', sort_order int not null default 0, updated_at timestamptz not null default now());

create table if not exists public.kelas7mit_tutorial_services(
  slug text primary key check (slug ~ '^[a-z0-9-]{2,40}$'), name text not null, host text not null default '', url text not null default '',
  category_slug text not null references public.kelas7mit_tutorial_categories(slug) on update cascade,
  status text not null check (status in ('active','beta','planned','deprecated','archived')),
  verified boolean not null default false, verified_at timestamptz, verified_note text not null default '',
  summary_id text not null default '', summary_en text not null default '', icon text not null default 'globe', logo_url text not null default '',
  legacy boolean not null default false, sort_order int not null default 0, updated_at timestamptz not null default now());

create table if not exists public.kelas7mit_tutorial_articles(
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9-]{3,90}$'),
  service_slug text not null references public.kelas7mit_tutorial_services(slug) on update cascade,
  category_slug text not null references public.kelas7mit_tutorial_categories(slug) on update cascade,
  title_id text not null, title_en text not null default '', summary_id text not null default '', summary_en text not null default '',
  status text not null default 'draft' check (status in ('draft','published')), verified boolean not null default false,
  featured boolean not null default false, popular boolean not null default false, minutes int not null default 3 check (minutes between 1 and 120),
  version int not null default 1, author text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists kelas7mit_tutorial_articles_status on public.kelas7mit_tutorial_articles(status, updated_at desc);

create table if not exists public.kelas7mit_tutorial_article_services(
  article_id uuid not null references public.kelas7mit_tutorial_articles(id) on delete cascade,
  service_slug text not null references public.kelas7mit_tutorial_services(slug) on update cascade on delete cascade,
  primary key (article_id, service_slug));

create table if not exists public.kelas7mit_tutorial_blocks(
  id uuid primary key default gen_random_uuid(), article_id uuid not null references public.kelas7mit_tutorial_articles(id) on delete cascade,
  position int not null, kind text not null,
  title_id text not null default '', title_en text not null default '', text_id text not null default '', text_en text not null default '',
  note_id text not null default '', note_en text not null default '', variant text not null default '', tone text not null default '',
  url text not null default '', unit text not null default '', level int not null default 0, flag boolean not null default false, extra text not null default '');
create index if not exists kelas7mit_tutorial_blocks_article on public.kelas7mit_tutorial_blocks(article_id, position);

create table if not exists public.kelas7mit_tutorial_block_items(
  id bigserial primary key, block_id uuid not null references public.kelas7mit_tutorial_blocks(id) on delete cascade,
  position int not null, role text not null, key text not null default '', parent_key text not null default '',
  label_id text not null default '', label_en text not null default '', text_id text not null default '', text_en text not null default '',
  hint_id text not null default '', hint_en text not null default '', flag boolean not null default false,
  num_a double precision not null default 0, num_b double precision not null default 0, target text not null default '');
create index if not exists kelas7mit_tutorial_items_block on public.kelas7mit_tutorial_block_items(block_id, position);

-- Revisi: salinan baris (bukan JSON) agar bisa dipulihkan.
create table if not exists public.kelas7mit_tutorial_revisions(
  id bigserial primary key, article_id uuid not null references public.kelas7mit_tutorial_articles(id) on delete cascade,
  version int not null, saved_at timestamptz not null default now(), saved_by text not null default '', note text not null default '',
  slug text not null, service_slug text not null, category_slug text not null, title_id text not null, title_en text not null default '',
  summary_id text not null default '', summary_en text not null default '', status text not null, verified boolean not null default false,
  featured boolean not null default false, popular boolean not null default false, minutes int not null default 3);
create index if not exists kelas7mit_tutorial_revisions_article on public.kelas7mit_tutorial_revisions(article_id, id desc);
create table if not exists public.kelas7mit_tutorial_revision_services(revision_id bigint not null references public.kelas7mit_tutorial_revisions(id) on delete cascade, service_slug text not null);
create table if not exists public.kelas7mit_tutorial_revision_blocks(
  id bigserial primary key, revision_id bigint not null references public.kelas7mit_tutorial_revisions(id) on delete cascade, position int not null, kind text not null,
  title_id text not null default '', title_en text not null default '', text_id text not null default '', text_en text not null default '',
  note_id text not null default '', note_en text not null default '', variant text not null default '', tone text not null default '',
  url text not null default '', unit text not null default '', level int not null default 0, flag boolean not null default false, extra text not null default '');
create table if not exists public.kelas7mit_tutorial_revision_items(
  id bigserial primary key, revision_block_id bigint not null references public.kelas7mit_tutorial_revision_blocks(id) on delete cascade,
  position int not null, role text not null, key text not null default '', parent_key text not null default '',
  label_id text not null default '', label_en text not null default '', text_id text not null default '', text_en text not null default '',
  hint_id text not null default '', hint_en text not null default '', flag boolean not null default false,
  num_a double precision not null default 0, num_b double precision not null default 0, target text not null default '');

create table if not exists public.kelas7mit_tutorial_feedback(
  id bigserial primary key, article_id uuid references public.kelas7mit_tutorial_articles(id) on delete cascade, slug text not null default '',
  helpful boolean not null, comment text not null default '' check (char_length(comment) <= 1000), lang text not null default 'id',
  client_hash text not null default '', created_at timestamptz not null default now(), reviewed boolean not null default false);
create index if not exists kelas7mit_tutorial_feedback_article on public.kelas7mit_tutorial_feedback(article_id, created_at desc);

create table if not exists public.kelas7mit_tutorial_media(
  id uuid primary key default gen_random_uuid(), path text not null unique, url text not null, mime text not null, size_bytes int not null, alt text not null default '',
  uploaded_by text not null default '', created_at timestamptz not null default now());

-- Siapa yang boleh mengelola: tipe akun + peran (pola ilike). level: editor (tulis, draf) atau admin (terbit, hapus).
create table if not exists public.kelas7mit_tutorial_staff(
  id bigserial primary key, account_type text not null check (account_type in ('student','guru','pengurus')), role_pattern text not null,
  level text not null check (level in ('editor','admin')), note text not null default '', unique (account_type, role_pattern));

alter table public.kelas7mit_tutorial_categories enable row level security;
alter table public.kelas7mit_tutorial_services enable row level security;
alter table public.kelas7mit_tutorial_articles enable row level security;
alter table public.kelas7mit_tutorial_article_services enable row level security;
alter table public.kelas7mit_tutorial_blocks enable row level security;
alter table public.kelas7mit_tutorial_block_items enable row level security;
alter table public.kelas7mit_tutorial_revisions enable row level security;
alter table public.kelas7mit_tutorial_revision_services enable row level security;
alter table public.kelas7mit_tutorial_revision_blocks enable row level security;
alter table public.kelas7mit_tutorial_revision_items enable row level security;
alter table public.kelas7mit_tutorial_feedback enable row level security;
alter table public.kelas7mit_tutorial_media enable row level security;
alter table public.kelas7mit_tutorial_staff enable row level security;

insert into public.kelas7mit_tutorial_staff(account_type, role_pattern, level, note) values
 ('pengurus','Presiden','admin','Presiden 7 MIT'),('pengurus','Wakil Presiden','admin','Wakil Presiden 7 MIT'),
 ('pengurus','Service Account','admin','Akun layanan untuk impor konten'),('guru','Akun Resmi','admin','Akun resmi 7 MIT'),
 ('guru','Guru Kelas','editor','Wali kelas'),('pengurus','Sekretariat%','editor','Sekretariat menulis dan menyunting')
on conflict do nothing;

-- Simpan artikel (upsert) + blok + item secara atomik. Revisi disalin sebelum isi diganti.
create or replace function public.tutorial_save_article(p jsonb, p_by text, p_note text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  a jsonb := p->'article'; aid uuid; cur public.kelas7mit_tutorial_articles%rowtype; rid bigint; b jsonb; bid uuid; it jsonb; nv int := 1; i int := 0; j int;
begin
  select * into cur from public.kelas7mit_tutorial_articles where slug = a->>'slug';
  if found then
    aid := cur.id; nv := cur.version + 1;
    insert into public.kelas7mit_tutorial_revisions(article_id,version,saved_by,note,slug,service_slug,category_slug,title_id,title_en,summary_id,summary_en,status,verified,featured,popular,minutes)
      values (cur.id,cur.version,p_by,coalesce(p_note,''),cur.slug,cur.service_slug,cur.category_slug,cur.title_id,cur.title_en,cur.summary_id,cur.summary_en,cur.status,cur.verified,cur.featured,cur.popular,cur.minutes) returning id into rid;
    insert into public.kelas7mit_tutorial_revision_services(revision_id,service_slug) select rid, service_slug from public.kelas7mit_tutorial_article_services where article_id=aid;
    with nb as (
      insert into public.kelas7mit_tutorial_revision_blocks(revision_id,position,kind,title_id,title_en,text_id,text_en,note_id,note_en,variant,tone,url,unit,level,flag,extra)
      select rid,position,kind,title_id,title_en,text_id,text_en,note_id,note_en,variant,tone,url,unit,level,flag,extra from public.kelas7mit_tutorial_blocks where article_id=aid order by position
      returning id, position)
    insert into public.kelas7mit_tutorial_revision_items(revision_block_id,position,role,key,parent_key,label_id,label_en,text_id,text_en,hint_id,hint_en,flag,num_a,num_b,target)
      select nb.id,i.position,i.role,i.key,i.parent_key,i.label_id,i.label_en,i.text_id,i.text_en,i.hint_id,i.hint_en,i.flag,i.num_a,i.num_b,i.target
      from nb join public.kelas7mit_tutorial_blocks ob on ob.article_id=aid and ob.position=nb.position join public.kelas7mit_tutorial_block_items i on i.block_id=ob.id;
    delete from public.kelas7mit_tutorial_blocks where article_id=aid;
    delete from public.kelas7mit_tutorial_article_services where article_id=aid;
    update public.kelas7mit_tutorial_articles set service_slug=a->>'service_slug', category_slug=a->>'category_slug', title_id=a->>'title_id', title_en=coalesce(a->>'title_en',''),
      summary_id=coalesce(a->>'summary_id',''), summary_en=coalesce(a->>'summary_en',''), status=a->>'status', verified=coalesce((a->>'verified')::boolean,false),
      featured=coalesce((a->>'featured')::boolean,false), popular=coalesce((a->>'popular')::boolean,false), minutes=coalesce((a->>'minutes')::int,3), version=nv, updated_at=now(),
      author=coalesce(nullif(p_by,''),author) where id=aid;
  else
    insert into public.kelas7mit_tutorial_articles(slug,service_slug,category_slug,title_id,title_en,summary_id,summary_en,status,verified,featured,popular,minutes,author,created_at,updated_at)
      values (a->>'slug',a->>'service_slug',a->>'category_slug',a->>'title_id',coalesce(a->>'title_en',''),coalesce(a->>'summary_id',''),coalesce(a->>'summary_en',''),a->>'status',
        coalesce((a->>'verified')::boolean,false),coalesce((a->>'featured')::boolean,false),coalesce((a->>'popular')::boolean,false),coalesce((a->>'minutes')::int,3),coalesce(p_by,''),
        coalesce((a->>'created_at')::timestamptz,now()),coalesce((a->>'updated_at')::timestamptz,now())) returning id into aid;
  end if;
  insert into public.kelas7mit_tutorial_article_services(article_id,service_slug)
    select distinct aid, s.value from jsonb_array_elements_text(coalesce(p->'services','[]'::jsonb)) s(value);
  for b in select * from jsonb_array_elements(coalesce(p->'blocks','[]'::jsonb)) loop
    i := i + 1;
    insert into public.kelas7mit_tutorial_blocks(article_id,position,kind,title_id,title_en,text_id,text_en,note_id,note_en,variant,tone,url,unit,level,flag,extra)
      values (aid,i,b->>'kind',coalesce(b->>'title_id',''),coalesce(b->>'title_en',''),coalesce(b->>'text_id',''),coalesce(b->>'text_en',''),coalesce(b->>'note_id',''),coalesce(b->>'note_en',''),
        coalesce(b->>'variant',''),coalesce(b->>'tone',''),coalesce(b->>'url',''),coalesce(b->>'unit',''),coalesce((b->>'level')::int,0),coalesce((b->>'flag')::boolean,false),coalesce(b->>'extra','')) returning id into bid;
    j := 0;
    for it in select * from jsonb_array_elements(coalesce(b->'items','[]'::jsonb)) loop
      j := j + 1;
      insert into public.kelas7mit_tutorial_block_items(block_id,position,role,key,parent_key,label_id,label_en,text_id,text_en,hint_id,hint_en,flag,num_a,num_b,target)
        values (bid,j,it->>'role',coalesce(it->>'key',''),coalesce(it->>'parent_key',''),coalesce(it->>'label_id',''),coalesce(it->>'label_en',''),coalesce(it->>'text_id',''),coalesce(it->>'text_en',''),
          coalesce(it->>'hint_id',''),coalesce(it->>'hint_en',''),coalesce((it->>'flag')::boolean,false),coalesce((it->>'num_a')::float8,0),coalesce((it->>'num_b')::float8,0),coalesce(it->>'target',''));
    end loop;
  end loop;
  return jsonb_build_object('id',aid,'version',nv,'slug',a->>'slug');
end $$;

-- Pulihkan revisi: isi sekarang disimpan sebagai revisi baru, lalu diganti isi revisi terpilih.
create or replace function public.tutorial_restore_revision(p_revision bigint, p_by text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.kelas7mit_tutorial_revisions%rowtype; payload jsonb;
begin
  select * into r from public.kelas7mit_tutorial_revisions where id=p_revision;
  if not found then raise exception 'Revisi tidak ditemukan.'; end if;
  payload := jsonb_build_object(
    'article', jsonb_build_object('slug',r.slug,'service_slug',r.service_slug,'category_slug',r.category_slug,'title_id',r.title_id,'title_en',r.title_en,'summary_id',r.summary_id,'summary_en',r.summary_en,
       'status',r.status,'verified',r.verified,'featured',r.featured,'popular',r.popular,'minutes',r.minutes),
    'services', coalesce((select jsonb_agg(service_slug) from public.kelas7mit_tutorial_revision_services where revision_id=r.id),'[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('kind',b.kind,'title_id',b.title_id,'title_en',b.title_en,'text_id',b.text_id,'text_en',b.text_en,'note_id',b.note_id,'note_en',b.note_en,'variant',b.variant,'tone',b.tone,'url',b.url,'unit',b.unit,'level',b.level,'flag',b.flag,'extra',b.extra,
        'items', coalesce((select jsonb_agg(jsonb_build_object('role',i.role,'key',i.key,'parent_key',i.parent_key,'label_id',i.label_id,'label_en',i.label_en,'text_id',i.text_id,'text_en',i.text_en,'hint_id',i.hint_id,'hint_en',i.hint_en,'flag',i.flag,'num_a',i.num_a,'num_b',i.num_b,'target',i.target) order by i.position) from public.kelas7mit_tutorial_revision_items i where i.revision_block_id=b.id),'[]'::jsonb)) order by b.position)
      from public.kelas7mit_tutorial_revision_blocks b where b.revision_id=r.id),'[]'::jsonb));
  return public.tutorial_save_article(payload, p_by, 'Pemulihan dari revisi v'||r.version);
end $$;

revoke all on function public.tutorial_save_article(jsonb,text,text) from public, anon, authenticated;
revoke all on function public.tutorial_restore_revision(bigint,text) from public, anon, authenticated;
grant execute on function public.tutorial_save_article(jsonb,text,text) to service_role;
grant execute on function public.tutorial_restore_revision(bigint,text) to service_role;
