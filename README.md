# tutorial.7mit — Pusat Bantuan 7 MIT

Next.js (ekspor statis) + Tailwind + Motion, dilayani Cloudflare Workers assets (`worker.js` memaksa HTTPS dan mengarahkan slug baru ke halaman cadangan).

- **Konten**: tabel `kelas7mit_tutorial_*` di server.7mit → edge function `tutorial-api` → `scripts/snapshot.mjs` (saat build, cadangan `content/seed.json`) → diperbarui lagi dari API saat halaman dibuka.
- **Penulisan awal**: `scripts/content/*.mjs`; `npx tsx scripts/build-seed.ts` memvalidasi dengan Zod dan menulis `content/seed.json` + SQL seed.
- **Admin** (`/admin`): masuk dengan akun akun.7mit; hak sunting dari tabel `kelas7mit_tutorial_staff` (server memeriksa di setiap aksi). Menerbitkan wajib punya visual interaktif.
- **AI** (`/ai`): Qwen3-0.6B ONNX via Transformers.js + WebGPU di Web Worker, diunduh hanya setelah pengguna setuju (~570 MB). Tanpa WebGPU/model, jawaban dari pencarian artikel. Komponen visual jawaban dipilih deterministik dan divalidasi Zod.
- Build: `npm run build` → `out/`. Deploy: `npx wrangler deploy`.
- Palet mengikuti design.7mit (marun), bukan biru.
