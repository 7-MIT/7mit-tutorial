import type { Bi } from './schemas';
export type DNode = { k: string; x: number; y: number; label: Bi; text: Bi; tone?: 'start' | 'end' | 'warn' };
export type DEdge = { from: string; to: string; label?: Bi };
export type Diagram = { nodes: DNode[]; edges: DEdge[] };
const B = (id: string, en: string): Bi => ({ id, en });
const N = (k: string, x: number, y: number, a: [string, string], b: [string, string], tone?: DNode['tone']): DNode => ({ k, x, y, label: B(...a), text: B(...b), tone });
const E = (from: string, to: string, l?: [string, string]): DEdge => ({ from, to, ...(l ? { label: B(...l) } : {}) });

export const DIAGRAMS: Record<string, Diagram> = {
  'auth-flow': { nodes: [
    N('u', 10, 50, ['Anda', 'You'], ['Mengisi nama pengguna dan kata sandi di halaman resmi.', 'Enter username and password on the official page.'], 'start'),
    N('f', 36, 20, ['Formulir', 'Form'], ['Mengirim data lewat koneksi aman (HTTPS).', 'Sends data over a secure connection (HTTPS).']),
    N('s', 62, 50, ['Server akun', 'Account server'], ['Memeriksa akun dan membuat sesi.', 'Checks the account and creates a session.']),
    N('t', 88, 20, ['Sesi aktif', 'Active session'], ['Token sesi menjaga Anda tetap masuk.', 'A session token keeps you signed in.'], 'end'),
  ], edges: [E('u', 'f'), E('f', 's', ['HTTPS', 'HTTPS']), E('s', 't', ['token', 'token'])] },
  'client-server': { nodes: [
    N('c', 12, 50, ['Antarmuka', 'Interface'], ['Menampilkan layar dan mengirim permintaan.', 'Shows screens and sends requests.'], 'start'),
    N('p', 50, 20, ['Server', 'Server'], ['Memeriksa peran dan izin sebelum menjawab.', 'Checks role and permission before answering.']),
    N('d', 88, 50, ['Data', 'Data'], ['Tabel per keperluan.', 'Per-purpose tables.'], 'end'),
  ], edges: [E('c', 'p', ['minta', 'request']), E('p', 'd', ['baca/tulis', 'read/write']), E('d', 'c', ['jawaban', 'answer'])] },
  'cloud-storage': { nodes: [
    N('u', 10, 50, ['Berkas Anda', 'Your file'], ['Dipilih dari perangkat.', 'Picked from your device.'], 'start'),
    N('a', 38, 20, ['Unggah', 'Upload'], ['Berkas dikirim aman.', 'File is sent securely.']),
    N('b', 66, 50, ['Penyimpanan', 'Storage'], ['Disimpan di ruang Anda.', 'Stored in your space.']),
    N('l', 90, 20, ['Tautan', 'Link'], ['Bagikan bila perlu.', 'Share if needed.'], 'end'),
  ], edges: [E('u', 'a'), E('a', 'b'), E('b', 'l')] },
  'ai-generation': { nodes: [
    N('q', 10, 50, ['Pertanyaan', 'Question'], ['Anda menulis apa yang ingin diketahui.', 'You write what you want to know.'], 'start'),
    N('c', 36, 20, ['Konteks', 'Context'], ['Riwayat dan berkas yang dilampirkan.', 'History and attached files.']),
    N('m', 62, 50, ['Model', 'Model'], ['Menyusun jawaban kata demi kata.', 'Composes the answer word by word.']),
    N('a', 88, 20, ['Jawaban', 'Answer'], ['Ditampilkan sambil mengalir.', 'Shown as it streams.'], 'end'),
  ], edges: [E('q', 'c'), E('c', 'm'), E('m', 'a', ['stream', 'stream'])] },
  'quiz-submit': { nodes: [
    N('a', 10, 50, ['Jawaban', 'Answer'], ['Siswa memilih jawaban.', 'The student picks an answer.'], 'start'),
    N('s', 38, 20, ['Kirim', 'Submit'], ['Jawaban dikirim ke server.', 'Answer is sent to the server.']),
    N('g', 66, 50, ['Nilai', 'Score'], ['Server menilai dan menyimpan.', 'The server scores and stores.']),
    N('r', 90, 20, ['Hasil', 'Result'], ['Skor ditampilkan.', 'The score is shown.'], 'end'),
  ], edges: [E('a', 's'), E('s', 'g'), E('g', 'r')] },
  'short-url': { nodes: [
    N('l', 10, 50, ['Tautan panjang', 'Long link'], ['Alamat asli yang panjang.', 'The long original address.'], 'start'),
    N('k', 40, 20, ['Kode', 'Code'], ['Dibuat kode pendek unik.', 'A unique short code is made.']),
    N('s', 68, 50, ['Tautan pendek', 'Short link'], ['Dibagikan ke orang lain.', 'Shared with others.']),
    N('r', 92, 20, ['Alihkan', 'Redirect'], ['Pengunjung diarahkan ke alamat asli.', 'Visitors are redirected to the original.'], 'end'),
  ], edges: [E('l', 'k'), E('k', 's'), E('s', 'r', ['klik', 'click'])] },
  'static-vs-dynamic': { nodes: [
    N('s', 12, 20, ['Statis', 'Static'], ['Berkas siap saji, sangat cepat.', 'Ready-made files, very fast.'], 'start'),
    N('d', 12, 80, ['Dinamis', 'Dynamic'], ['Dibuat saat diminta dari data.', 'Built on request from data.']),
    N('b', 56, 50, ['Peramban', 'Browser'], ['Menampilkan hasil.', 'Shows the result.']),
    N('x', 90, 50, ['Pengguna', 'User'], ['Melihat halaman.', 'Sees the page.'], 'end'),
  ], edges: [E('s', 'b', ['langsung', 'direct']), E('d', 'b', ['diproses', 'processed']), E('b', 'x')] },
  'service-registry': { nodes: [
    N('a', 50, 12, ['akun.7mit', 'akun.7mit'], ['Akun tunggal untuk semua layanan.', 'The single account for all services.'], 'start'),
    N('o', 16, 50, ['OneClass', 'OneClass'], ['Portal siswa, guru, pengurus.', 'Student, teacher, officer portal.']),
    N('i', 50, 50, ['intelligence', 'intelligence'], ['Asisten AI.', 'AI assistant.']),
    N('q', 84, 50, ['quiz', 'quiz'], ['Kuis interaktif (beta).', 'Interactive quizzes (beta).']),
    N('s', 50, 88, ['server.7mit', 'server.7mit'], ['Data dan fungsi server.', 'Data and server functions.'], 'end'),
  ], edges: [E('a', 'o'), E('a', 'i'), E('a', 'q'), E('o', 's'), E('i', 's'), E('q', 's')] },
  'role-access': { nodes: [
    N('a', 10, 50, ['Akun', 'Account'], ['Tipe dan peran dibaca dari server.', 'Type and role are read from the server.'], 'start'),
    N('r', 40, 50, ['Aturan peran', 'Role rules'], ['Matriks izin per sumber daya.', 'Permission matrix per resource.']),
    N('o', 72, 20, ['Boleh', 'Allowed'], ['Tindakan dijalankan.', 'The action runs.'], 'end'),
    N('x', 72, 80, ['Ditolak', 'Denied'], ['Server menolak dan mencatat.', 'The server refuses and logs it.'], 'warn'),
  ], edges: [E('a', 'r'), E('r', 'o', ['sesuai', 'match']), E('r', 'x', ['tidak sesuai', 'no match'])] },
  'data-flow': { nodes: [
    N('u', 10, 50, ['Layanan', 'Service'], ['Meminta data.', 'Asks for data.'], 'start'),
    N('f', 38, 20, ['Fungsi server', 'Server function'], ['Memeriksa izin.', 'Checks permission.']),
    N('t', 66, 50, ['Tabel', 'Tables'], ['Satu tabel per keperluan.', 'One table per purpose.']),
    N('o', 90, 20, ['Jawaban', 'Reply'], ['Data dikirim kembali.', 'Data is sent back.'], 'end'),
  ], edges: [E('u', 'f'), E('f', 't'), E('t', 'o')] },
};
