// Registri layanan 7 MIT. Status berdasarkan pemeriksaan jaringan nyata (lihat verifiedNote); yang tidak terjangkau ditandai planned dan belum terverifikasi.
const B = (id, en) => ({ id, en });
const D = '2026-11-11T03:00:00Z';
export const categories = [
  { slug: 'mulai', name: B('Mulai', 'Getting started'), description: B('Kenali ekosistem 7 MIT dan langkah pertama.', 'Meet the 7 MIT ecosystem and take your first steps.'), icon: 'rocket', sort: 1 },
  { slug: 'akun-keamanan', name: B('Akun & Keamanan', 'Account & Security'), description: B('Masuk, pulihkan akun, kelola perangkat.', 'Sign in, recover your account, manage devices.'), icon: 'shield-check', sort: 2 },
  { slug: 'belajar', name: B('Belajar & Kelas', 'Learning & Class'), description: B('OneClass, kuis, belajar, dan papan tulis.', 'OneClass, quizzes, learning, and whiteboard.'), icon: 'graduation-cap', sort: 3 },
  { slug: 'produktivitas', name: B('Produktivitas', 'Productivity'), description: B('Tautan, formulir, berkas, dan tampilan.', 'Links, forms, files, and display.'), icon: 'zap', sort: 4 },
  { slug: 'ai', name: B('Asisten AI', 'AI assistant'), description: B('intelligence.7mit dan asisten bantuan.', 'intelligence.7mit and the help assistant.'), icon: 'sparkles', sort: 5 },
  { slug: 'infrastruktur', name: B('Infrastruktur', 'Infrastructure'), description: B('Server, cloud, hosting, dan TrustLayer.', 'Server, cloud, hosting, and TrustLayer.'), icon: 'server', sort: 6 },
  { slug: 'transparansi', name: B('Transparansi', 'Transparency'), description: B('Anggaran dan status layanan.', 'Budget and service status.'), icon: 'bar-chart-3', sort: 7 },
];
const ok = (host) => `Diperiksa ${D.slice(0, 10)}: https://${host} menjawab dan isinya sesuai layanan.`;
const no = (host) => `Diperiksa ${D.slice(0, 10)}: https://${host} tidak dapat dijangkau dari lingkungan pemeriksaan. Status belum terverifikasi.`;
const S = (slug, name, host, category, status, verified, note, id, en, icon, extra = {}) => ({
  slug, name, host, url: `https://${host}`, category, status, verified, verifiedAt: D, verifiedNote: note, summary: B(id, en), icon, logoUrl: '', legacy: false, sort: 0, ...extra,
});
export const services = [
  S('akun', 'akun.7mit', 'akun.7mit.org', 'akun-keamanan', 'active', true, ok('akun.7mit.org'), 'Akun tunggal 7 MIT: masuk, Google, pemulihan kata sandi, dan perangkat.', 'The single 7 MIT account: sign-in, Google, password recovery, and devices.', 'user-round'),
  S('oneclass', 'OneClass.7MIT', 'one.7mit.org', 'belajar', 'active', true, ok('one.7mit.org'), 'Satu portal untuk siswa, guru, dan pengurus dengan mode sesuai peran.', 'One portal for students, teachers, and officers with role-based modes.', 'layout-dashboard'),
  S('intelligence', 'intelligence.7mit', 'intelligence.7mit.org', 'ai', 'active', true, ok('intelligence.7mit.org'), 'Asisten AI untuk chat, analisis berkas, dan grafik.', 'AI assistant for chat, file analysis, and charts.', 'sparkles'),
  S('quiz', 'quiz.7mit', 'quiz.7mit.org', 'belajar', 'beta', true, ok('quiz.7mit.org') + ' Halaman memuat skrip kuis dan kontak resmi.', 'Kuis interaktif: guru membuat, siswa bergabung dan menjawab.', 'Interactive quizzes: teachers create, students join and answer.', 'brain-circuit'),
  S('forms', 'forms.7mit', 'forms.7mit.org', 'produktivitas', 'planned', false, no('forms.7mit.org'), 'Formulir dan survei. Belum tersedia untuk dipakai.', 'Forms and surveys. Not available yet.', 'clipboard-list'),
  S('belajar', 'belajar.7mit', 'social.7mit.org', 'belajar', 'beta', true, `Diperiksa ${D.slice(0, 10)}: halaman belajar.7mit (LMS + SIS) tersaji di social.7mit.org. Alamat belajar.7mit.org sendiri belum terjangkau.`, 'LMS dan informasi sekolah: materi, tugas, nilai, jadwal, kehadiran.', 'LMS and school information: materials, assignments, grades, schedule, attendance.', 'book-open'),
  S('server', 'server.7mit', 'server.7mit.org', 'infrastruktur', 'active', true, ok('server.7mit.org'), 'Pusat data dan fungsi server ekosistem 7 MIT.', 'Data hub and server functions of the 7 MIT ecosystem.', 'database'),
  S('cloud', 'cloud.7mit', 'cloud.7mit.org', 'infrastruktur', 'planned', false, no('cloud.7mit.org'), 'Penyimpanan berkas. Belum tersedia untuk dipakai.', 'File storage. Not available yet.', 'cloud'),
  S('hosting', 'hosting.7mit', 'hosting.7mit.org', 'infrastruktur', 'planned', false, no('hosting.7mit.org'), 'Hosting situs. Belum tersedia untuk dipakai.', 'Site hosting. Not available yet.', 'globe'),
  S('anggaran', 'anggaran.7mit', 'anggaran.7mit.org', 'transparansi', 'active', true, ok('anggaran.7mit.org'), 'Transparansi APBK: lihat pemasukan dan pengeluaran.', 'APBK transparency: view income and spending.', 'wallet'),
  S('status', 'status.7mit', 'status.7mit.org', 'transparansi', 'active', true, ok('status.7mit.org'), 'Halaman status layanan 7 MIT.', 'The 7 MIT service status page.', 'activity'),
  S('link', 'link.7mit', 'link.7mit.org', 'produktivitas', 'active', true, ok('link.7mit.org'), 'Pemendek tautan, QR, dan halaman personal.', 'Link shortener, QR codes, and personal pages.', 'link-2'),
  S('whiteboard', 'whiteboard.7mit', 'whiteboard.7mit.org', 'belajar', 'active', true, ok('whiteboard.7mit.org'), 'Papan tulis digital untuk menggambar dan menjelaskan.', 'Digital whiteboard for drawing and explaining.', 'pen-tool'),
  S('trustlayer', 'TrustLayer.7mit', 'trustlayer.7mit.org', 'infrastruktur', 'beta', true, ok('trustlayer.7mit.org') + ' Halaman publiknya menyebut tahap rencana; fungsi pemeriksaan sudah berjalan di OneClass.', 'Lapisan pemeriksaan hak akses, data, dan konfigurasi.', 'A layer that checks access rights, data, and configuration.', 'shield'),
  S('display', 'display.7mit', 'display.7mit.org', 'produktivitas', 'planned', false, no('display.7mit.org'), 'Papan tampilan kelas. Belum tersedia untuk dipakai.', 'Classroom display board. Not available yet.', 'monitor'),
  S('main', '7mit.org', '7mit.org', 'mulai', 'active', true, ok('7mit.org'), 'Beranda resmi 7 MIT — Kharisma Bangsa.', 'The official 7 MIT homepage — Kharisma Bangsa.', 'house'),
  S('siswa', 'siswa.7mit (lama)', 'siswa.7mit.org', 'belajar', 'deprecated', true, ok('siswa.7mit.org') + ' Digantikan OneClass.', 'Portal Siswa lama. Gunakan OneClass.7MIT.', 'Legacy student portal. Use OneClass.7MIT.', 'archive', { legacy: true }),
  S('guru', 'guru.7mit (lama)', 'guru.7mit.org', 'belajar', 'deprecated', true, ok('guru.7mit.org') + ' Digantikan OneClass.', 'Portal Guru lama. Gunakan OneClass.7MIT.', 'Legacy teacher portal. Use OneClass.7MIT.', 'archive', { legacy: true }),
  S('pengurus', 'pengurus.7mit (lama)', 'pengurus.7mit.org', 'belajar', 'deprecated', true, ok('pengurus.7mit.org') + ' Digantikan OneClass.', 'Portal Pengurus lama. Gunakan OneClass.7MIT.', 'Legacy officers portal. Use OneClass.7MIT.', 'archive', { legacy: true }),
].map((s, i) => ({ ...s, sort: i + 1 }));
