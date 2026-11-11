// Semua permintaan lewat worker ini: paksa HTTPS, pasang header keamanan, dan arahkan slug baru ke halaman cadangan.
const SECURITY = {
  "strict-transport-security": "max-age=31536000",
  "content-security-policy": "upgrade-insecure-requests",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};
const secure = (res, extra = {}) => {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries({ ...SECURITY, ...extra })) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
};
// Halaman dinamis dari CMS: slug yang belum ada saat build memakai halaman cadangan, slug asli dibaca di peramban.
const FALLBACKS = [[/^\/help\/article\/[^/]+\/?$/, "/help/article/__fallback/"], [/^\/services\/[^/]+\/?$/, "/services/__fallback/"], [/^\/help\/category\/[^/]+\/?$/, "/help/category/__fallback/"]];
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === "http:") { url.protocol = "https:"; return Response.redirect(url.toString(), 301); }
    let res = await env.ASSETS.fetch(request);
    if (res.status === 404 && (request.method === "GET" || request.method === "HEAD")) {
      const hit = FALLBACKS.find(([re]) => re.test(url.pathname));
      if (hit) {
        const r = await env.ASSETS.fetch(new Request(new URL(hit[1], url), { method: request.method, headers: request.headers }));
        if (r.ok) return secure(new Response(r.body, { status: 200, headers: r.headers }), { "cache-control": "no-cache" });
      }
    }
    return secure(res);
  },
};
