import type { Bi } from './schemas';
export type MItem = { t: Bi; s?: Bi; badge?: Bi };
export type MScreen = { h: Bi; p?: Bi; fields?: { l: Bi; v: string; pw?: boolean }[]; items?: MItem[]; chips?: Bi[]; btns: { l: Bi; to: number }[]; ok?: boolean };
export type Mock = { url: string; title: Bi; screens: MScreen[] };
const b = (id: string, en: string): Bi => ({ id, en });
const bt = (l: [string, string], to: number) => ({ l: b(...l), to });
const it = (t: [string, string], s?: [string, string], badge?: [string, string]): MItem => ({ t: b(...t), ...(s ? { s: b(...s) } : {}), ...(badge ? { badge: b(...badge) } : {}) });
const R = bt(['Ulangi demo', 'Restart demo'], 0);

export const MOCKS: Record<string, Mock> = {
  'login-akun': { url: 'akun.7mit.org', title: b('Masuk', 'Sign in'), screens: [
    { h: b('Masuk ke akun 7 MIT', 'Sign in to your 7 MIT account'), p: b('Isian di bawah hanya contoh dan tidak bisa diketik.', 'The fields below are samples and cannot be typed into.'), fields: [{ l: b('Nama pengguna', 'Username'), v: 'contoh@7mit' }, { l: b('Kata sandi', 'Password'), v: '••••••••', pw: true }], btns: [bt(['Masuk', 'Sign in'], 1), bt(['Masuk dengan Google', 'Sign in with Google'], 2)] },
    { h: b('Pilih akun', 'Choose an account'), p: b('Nama pengguna ini dipakai lebih dari satu akun.', 'This username belongs to more than one account.'), items: [it(['Contoh — Siswa', 'Contoh — Student'], ['Tipe: siswa', 'Type: student']), it(['Contoh — Pengurus', 'Contoh — Officer'], ['Tipe: pengurus', 'Type: officer'])], btns: [bt(['Pilih akun pertama', 'Pick first account'], 3)] },
    { h: b('Menghubungkan Google…', 'Connecting Google…'), p: b('Anda akan dialihkan ke Google lalu kembali.', 'You will be sent to Google and back.'), btns: [bt(['Lanjut', 'Continue'], 3)] },
    { h: b('Berhasil masuk', 'Signed in'), p: b('Sesi dibuat. Anda dialihkan ke layanan tujuan.', 'A session was created. You are redirected to the service.'), ok: true, btns: [R] },
  ] },
  'recover-password': { url: 'akun.7mit.org/forgot-pwd', title: b('Lupa kata sandi', 'Forgot password'), screens: [
    { h: b('Pulihkan akun', 'Recover your account'), p: b('Masukkan nama pengguna contoh.', 'Enter the sample username.'), fields: [{ l: b('Nama pengguna', 'Username'), v: 'contoh@7mit' }], btns: [bt(['Kirim petunjuk', 'Send instructions'], 1)] },
    { h: b('Periksa petunjuk', 'Check the instructions'), p: b('Dalam layanan nyata, petunjuk dikirim lewat saluran resmi. Demo ini tidak mengirim apa pun.', 'In the real service instructions arrive through the official channel. This demo sends nothing.'), btns: [bt(['Buat kata sandi baru', 'Create a new password'], 2)] },
    { h: b('Kata sandi baru', 'New password'), fields: [{ l: b('Kata sandi baru', 'New password'), v: '••••••••••', pw: true }], p: b('Gunakan kata sandi panjang dan unik.', 'Use a long, unique password.'), btns: [bt(['Simpan', 'Save'], 3)] },
    { h: b('Selesai', 'Done'), p: b('Kata sandi diperbarui. Masuk kembali.', 'Password updated. Sign in again.'), ok: true, btns: [R] },
  ] },
  'sessions-devices': { url: 'akun.7mit.org/perangkat', title: b('Perangkat', 'Devices'), screens: [
    { h: b('Perangkat yang masuk', 'Signed-in devices'), items: [it(['iPad — Safari', 'iPad — Safari'], ['Saat ini', 'This device'], ['Aktif', 'Active']), it(['Laptop sekolah', 'School laptop'], ['2 hari lalu', '2 days ago']), it(['Perangkat tidak dikenal', 'Unknown device'], ['Lokasi asing', 'Unfamiliar location'], ['Curiga', 'Suspicious'])], btns: [bt(['Keluarkan perangkat tidak dikenal', 'Sign out unknown device'], 1)] },
    { h: b('Sesi dikeluarkan', 'Session ended'), p: b('Segera ganti kata sandi bila ini bukan Anda.', 'Change your password right away if this was not you.'), ok: true, btns: [R] },
  ] },
  'oneclass-dashboard': { url: 'one.7mit.org', title: b('Ringkasan', 'Overview'), screens: [
    { h: b('Ringkasan (data contoh)', 'Overview (sample data)'), chips: [b('Jadwal', 'Schedule'), b('Iuran', 'Dues'), b('Kuis', 'Quiz')], items: [it(['Matematika — 07.30', 'Math — 07:30']), it(['Character Education — 09.00', 'Character Education — 09:00']), it(['Agama — 10.30', 'Religion — 10:30'])], btns: [bt(['Buka Iuran', 'Open Dues'], 1)] },
    { h: b('Iuran (DATA UJI)', 'Dues (TEST DATA)'), items: [it(['Periode 1', 'Period 1'], ['Rp10.000', 'Rp10,000'], ['Lunas', 'Paid']), it(['Periode 2', 'Period 2'], ['Rp10.000', 'Rp10,000'], ['Lunas', 'Paid']), it(['Periode 3', 'Period 3'], ['Rp10.000', 'Rp10,000'], ['Belum', 'Unpaid'])], btns: [R] },
  ] },
  'ai-chat': { url: 'intelligence.7mit.org', title: b('Obrolan', 'Chat'), screens: [
    { h: b('Tanya apa saja', 'Ask anything'), chips: [b('Jelaskan fotosintesis', 'Explain photosynthesis'), b('Buat grafik sederhana', 'Make a simple chart')], p: b('Pilih contoh pertanyaan.', 'Pick a sample question.'), btns: [bt(['Jelaskan fotosintesis', 'Explain photosynthesis'], 1)] },
    { h: b('Jawaban contoh', 'Sample answer'), p: b('Fotosintesis adalah cara tumbuhan membuat makanan dari cahaya, air, dan karbon dioksida. (Teks demo, bukan jawaban model.)', 'Photosynthesis is how plants make food from light, water, and carbon dioxide. (Demo text, not a model answer.)'), btns: [bt(['Ubah jadi grafik', 'Turn into a chart'], 2)] },
    { h: b('Grafik contoh', 'Sample chart'), items: [it(['Cahaya', 'Light'], undefined, ['████', '████']), it(['Air', 'Water'], undefined, ['███', '███']), it(['CO₂', 'CO₂'], undefined, ['██', '██'])], btns: [R] },
  ] },
  'quiz-join': { url: 'quiz.7mit.org', title: b('Gabung kuis', 'Join quiz'), screens: [
    { h: b('Masukkan kode kuis', 'Enter quiz code'), fields: [{ l: b('Kode', 'Code'), v: 'DEMO-123' }], btns: [bt(['Gabung', 'Join'], 1)] },
    { h: b('Menunggu guru memulai', 'Waiting for the teacher'), p: b('Anda sudah masuk ke ruang kuis demo.', 'You have joined the demo quiz room.'), ok: true, btns: [R] },
  ] },
  'quiz-answer': { url: 'quiz.7mit.org', title: b('Soal', 'Question'), screens: [
    { h: b('Soal 1 dari 2', 'Question 1 of 2'), p: b('2 + 3 = ?', '2 + 3 = ?'), chips: [b('4', '4'), b('5', '5'), b('6', '6')], btns: [bt(['Jawab: 5', 'Answer: 5'], 1)] },
    { h: b('Benar!', 'Correct!'), p: b('Jawaban dikirim ke server untuk dinilai. Lanjut ke soal berikutnya.', 'Your answer is sent to the server for scoring. On to the next one.'), ok: true, btns: [bt(['Soal berikutnya', 'Next question'], 2)] },
    { h: b('Soal 2 dari 2', 'Question 2 of 2'), p: b('10 − 4 = ?', '10 − 4 = ?'), chips: [b('5', '5'), b('6', '6'), b('7', '7')], btns: [bt(['Jawab: 6', 'Answer: 6'], 3)] },
    { h: b('Skor: 2/2 (DATA UJI)', 'Score: 2/2 (TEST DATA)'), ok: true, btns: [R] },
  ] },
  'link-shorten': { url: 'link.7mit.org', title: b('Persingkat tautan', 'Shorten a link'), screens: [
    { h: b('Tempel URL panjang', 'Paste a long URL'), fields: [{ l: b('URL', 'URL'), v: 'https://contoh.org/halaman/yang/sangat/panjang' }], btns: [bt(['Persingkat', 'Shorten'], 1)] },
    { h: b('Tautan pendek (contoh)', 'Short link (sample)'), p: b('link.7mit.org/contoh — tautan ini tidak nyata.', 'link.7mit.org/contoh — this link is not real.'), ok: true, btns: [R] },
  ] },
  'anggaran-explorer': { url: 'anggaran.7mit.org', title: b('Anggaran', 'Budget'), screens: [
    { h: b('Ringkasan anggaran (DATA UJI)', 'Budget overview (TEST DATA)'), items: [it(['Pemasukan', 'Income'], ['Rp1.000.000', 'Rp1,000,000']), it(['Pengeluaran', 'Spending'], ['Rp650.000', 'Rp650,000']), it(['Sisa', 'Remaining'], ['Rp350.000', 'Rp350,000'])], btns: [bt(['Lihat rincian', 'See details'], 1)] },
    { h: b('Rincian (DATA UJI)', 'Details (TEST DATA)'), items: [it(['Kegiatan kelas', 'Class activities'], ['Rp400.000', 'Rp400,000']), it(['Perlengkapan', 'Supplies'], ['Rp250.000', 'Rp250,000'])], btns: [R] },
  ] },
  'status-board': { url: 'status.7mit.org', title: b('Status', 'Status'), screens: [
    { h: b('Status layanan (contoh)', 'Service status (sample)'), items: [it(['akun.7mit', 'akun.7mit'], undefined, ['Normal', 'Operational']), it(['OneClass', 'OneClass'], undefined, ['Normal', 'Operational']), it(['quiz.7mit', 'quiz.7mit'], undefined, ['Gangguan ringan', 'Minor issue'])], btns: [bt(['Buka detail quiz', 'Open quiz details'], 1)] },
    { h: b('quiz.7mit: gangguan ringan', 'quiz.7mit: minor issue'), p: b('Tim sedang menyelidiki. Contoh saja.', 'The team is investigating. Sample only.'), btns: [R] },
  ] },
  'whiteboard-tools': { url: 'whiteboard.7mit.org', title: b('Papan tulis', 'Whiteboard'), screens: [
    { h: b('Pilih alat', 'Pick a tool'), chips: [b('Pena', 'Pen'), b('Penghapus', 'Eraser'), b('Bentuk', 'Shapes')], p: b('Alat dipilih lalu digunakan di kanvas.', 'Choose a tool, then draw on the canvas.'), btns: [bt(['Pakai pena', 'Use the pen'], 1)] },
    { h: b('Menggambar', 'Drawing'), p: b('Kanvas demo: garis muncul saat Anda menggambar pada layanan nyata.', 'Demo canvas: lines appear as you draw in the real service.'), ok: true, btns: [R] },
  ] },
  'form-fill': { url: 'forms.7mit.org (rancangan)', title: b('Formulir', 'Form'), screens: [
    { h: b('Contoh formulir (rancangan)', 'Sample form (draft)'), fields: [{ l: b('Nama', 'Name'), v: 'Contoh' }], btns: [bt(['Kirim', 'Submit'], 1)] },
    { h: b('Terkirim', 'Submitted'), p: b('Layanan ini belum tersedia; ini hanya gambaran.', 'This service is not available yet; this is a concept only.'), btns: [R] },
  ] },
  'file-manager': { url: 'cloud.7mit.org (rancangan)', title: b('Berkas', 'Files'), screens: [
    { h: b('Berkas saya (rancangan)', 'My files (draft)'), items: [it(['Tugas.pdf', 'Homework.pdf'], ['120 KB', '120 KB']), it(['Foto.png', 'Photo.png'], ['800 KB', '800 KB'])], btns: [bt(['Bagikan Tugas.pdf', 'Share Homework.pdf'], 1)] },
    { h: b('Tautan dibagikan (contoh)', 'Link shared (sample)'), p: b('Gambaran saja; layanan belum tersedia.', 'Concept only; the service is not available yet.'), btns: [R] },
  ] },
  'deploy-wizard': { url: 'hosting.7mit.org (rancangan)', title: b('Terbitkan situs', 'Publish a site'), screens: [
    { h: b('Pilih berkas situs (rancangan)', 'Choose site files (draft)'), btns: [bt(['Lanjut', 'Continue'], 1)] },
    { h: b('Menerbitkan…', 'Publishing…'), p: b('Gambaran saja; layanan belum tersedia.', 'Concept only; the service is not available yet.'), btns: [R] },
  ] },
  'display-board': { url: 'display.7mit.org (rancangan)', title: b('Papan tampilan', 'Display board'), screens: [
    { h: b('Papan tampilan kelas (rancangan)', 'Classroom display (draft)'), items: [it(['Pengumuman hari ini', "Today's announcement"]), it(['Jadwal pelajaran', 'Lesson schedule'])], btns: [bt(['Ganti slide', 'Next slide'], 1)] },
    { h: b('Slide 2 (rancangan)', 'Slide 2 (draft)'), p: b('Gambaran saja; layanan belum tersedia.', 'Concept only; the service is not available yet.'), btns: [R] },
  ] },
};
