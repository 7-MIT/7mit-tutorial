// Validasi konten penulisan dengan Zod lalu tulis content/seed.json dan SQL seed (content/seed-*.sql).
import { writeFileSync, mkdirSync } from 'node:fs';
import { z } from 'zod';
import { Article, Category, Service } from '../src/lib/schemas';
import { categories, services } from './content/services.mjs';
import { articles } from './content/articles.mjs';
import { articleToPayload, serviceToRow, categoryToRow } from '../shared/mapping';

const cats = z.array(Category).parse(categories);
const svcs = z.array(Service).parse(services);
const ArtIn = Article.omit({ id: true, version: true, author: true });
const arts = z.array(ArtIn).parse(articles);
const svSlugs = new Set(svcs.map((s) => s.slug));
const caSlugs = new Set(cats.map((c) => c.slug));
for (const a of arts) {
  if (!svSlugs.has(a.service) || !caSlugs.has(a.category)) throw new Error('Rujukan tidak valid: ' + a.slug);
  for (const s of a.services) if (!svSlugs.has(s)) throw new Error('Layanan tidak dikenal: ' + s);
}
mkdirSync('content', { recursive: true });
const published = arts.filter((a) => a.status === 'published');
const bundle = {
  generatedAt: new Date().toISOString(),
  categories: cats,
  services: svcs,
  articles: published.map((a, i) => ({ ...a, id: `seed-${i}`, version: 1, author: 'Seed' })),
};
writeFileSync('content/seed.json', JSON.stringify(bundle));

const q = (v: unknown) => (v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : "'" + String(v).split("'").join("''") + "'");
const ins = (table: string, rows: Record<string, unknown>[], conflict: string) => {
  const cols = Object.keys(rows[0]);
  const vals = rows.map((r) => '(' + cols.map((c) => q(r[c])).join(',') + ')').join(',\n');
  const upd = cols.filter((c) => c !== conflict).map((c) => c + '=excluded.' + c).join(',');
  return `insert into public.${table}(${cols.join(',')}) values\n${vals}\non conflict (${conflict}) do update set ${upd};`;
};
writeFileSync('content/seed-0.sql', ins('kelas7mit_tutorial_categories', cats.map(categoryToRow), 'slug') + '\n' + ins('kelas7mit_tutorial_services', svcs.map(serviceToRow), 'slug'));
arts.forEach((a, i) => {
  const p = JSON.stringify(articleToPayload(a));
  writeFileSync(`content/seed-${i + 1}.sql`, `select public.tutorial_save_article($j$${p}$j$::jsonb, 'Seed 7 MIT', 'Seed awal');`);
});
console.log(`ok: ${cats.length} kategori, ${svcs.length} layanan, ${arts.length} artikel`);
