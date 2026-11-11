// Tulis sitemap.xml dan robots.txt ke out/ setelah build.
import { readFileSync, writeFileSync } from 'node:fs';
const b = JSON.parse(readFileSync('content/snapshot.json', 'utf8'));
const base = 'https://tutorial.7mit.org';
const paths = ['/', '/help/', '/help/categories/', '/services/', '/search/', '/ai/', '/troubleshooting/', ...b.categories.map((c) => `/help/category/${c.slug}/`), ...b.services.map((s) => `/services/${s.slug}/`), ...b.articles.map((a) => `/help/article/${a.slug}/`)];
writeFileSync('out/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `<url><loc>${base}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync('out/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${base}/sitemap.xml\n`);
console.log('sitemap:', paths.length, 'url');
