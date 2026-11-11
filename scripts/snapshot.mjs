// Ambil konten terbit dari tutorial-api lalu simpan sebagai content/snapshot.json (cadangan: content/seed.json, lalu bundel kosong).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
const API = process.env.TUTORIAL_API || 'https://lajzrempjyoqkubkumhb.supabase.co/functions/v1/tutorial-api';
mkdirSync('content', { recursive: true });
let bundle = null;
try {
  const r = await fetch(API, { signal: AbortSignal.timeout(20000) });
  const j = await r.json();
  if (j.ok && j.articles?.length) bundle = j;
  else console.warn('API kosong atau gagal, memakai cadangan.');
} catch (e) { console.warn('API tidak terjangkau:', e.message); }
if (!bundle && existsSync('content/seed.json')) bundle = JSON.parse(readFileSync('content/seed.json', 'utf8'));
if (!bundle) bundle = { generatedAt: new Date().toISOString(), categories: [], services: [], articles: [] };
writeFileSync('content/snapshot.json', JSON.stringify(bundle));
console.log(`snapshot: ${bundle.articles.length} artikel, ${bundle.services.length} layanan`);
