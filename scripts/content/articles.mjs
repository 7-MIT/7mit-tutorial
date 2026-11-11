const B = (id, en) => ({ id, en });
const h = (id, en) => ({ kind: 'heading', level: 2, text: B(id, en) });
const t = (id, en) => ({ kind: 'text', text: B(id, en) });
const co = (tone, id, en, ti, te) => ({ kind: 'callout', tone, ...(ti ? { title: B(ti, te) } : {}), text: B(id, en) });
const st = (title, steps) => ({ kind: 'steps', ...(title ? { title: B(...title) } : {}), steps: steps.map(([a, b, c, d, e, f]) => ({ title: B(a, b), text: B(c, d), ...(e ? { hint: B(e, f) } : {}) })) });
const mock = (preset, cap) => ({ kind: 'mock', preset, caption: B(...cap) });
const dia = (preset, title, cap) => ({ kind: 'diagram', preset, title: B(...title), caption: B(...cap) });
const q = (key, tx, ex, opts) => ({ key, text: B(...tx), explanation: B(...ex), options: opts.map(([a, b, c]) => ({ label: B(a, b), correct: !!c })) });
const quiz = (title, qs) => ({ kind: 'quiz', title: B(...title), questions: qs });
const DRAFT = co('draft', 'Layanan ini belum terverifikasi tersedia. Isi artikel ini rancangan dan akan diperbarui setelah layanan benar-benar berjalan.', 'This service is not verified as available. This article is a draft and will be updated once the service is really running.', 'Draf', 'Draft');
const A = (slug, service, category, title, summary, minutes, blocks, o = {}) => ({
  slug, service, services: o.services ?? [service], category, title: B(...title), summary: B(...summary), status: 'published', verified: !o.draft, featured: !!o.featured, popular: !!o.popular, minutes,
  createdAt: '2026-11-11T03:00:00Z', updatedAt: '2026-11-11T03:00:00Z', blocks,
});

export const articles = [
  A('mengenal-ekosistem-7mit', 'main', 'mulai', ['Mengenal ekosistem 7 MIT', 'Meet the 7 MIT ecosystem'], ['Peta layanan digital 7 MIT dan layanan mana yang bisa dipakai sekarang.', 'A map of 7 MIT digital services and which ones you can use today.'], 4, [
    t('7 MIT punya beberapa layanan digital. Semuanya memakai satu akun dari akun.7mit dan data di server.7mit.', '7 MIT has several digital services. All use one account from akun.7mit and data on server.7mit.'),
    dia('service-registry', ['Peta layanan', 'Service map'], ['Klik sebuah layanan untuk melihat perannya. Beberapa layanan masih rencana.', 'Click a service to see its role. Some services are still planned.']),
    h('Layanan mana yang sudah ada?', 'Which services exist?'),
    t('Daftar lengkap dengan status terverifikasi ada di halaman Layanan. Layanan yang belum terjangkau kami tandai “rencana”, bukan dianggap aktif.', 'The full list with verified status is on the Services page. Services we could not reach are marked “planned”, not assumed active.'),
    quiz(['Cek pemahaman', 'Check your understanding'], [q('q1', ['Akun apa yang dipakai di semua layanan?', 'Which account is used across all services?'], ['Semua layanan memakai akun dari akun.7mit.', 'All services use the account from akun.7mit.'], [['akun.7mit', 'akun.7mit', true], ['Akun terpisah per layanan', 'A separate account per service', false]])]),
  ], { featured: true, popular: true }),

  A('masuk-dengan-akun-7mit', 'akun', 'akun-keamanan', ['Masuk dengan akun 7 MIT', 'Sign in with your 7 MIT account'], ['Langkah masuk memakai nama pengguna atau Google, termasuk jika ada nama pengguna ganda.', 'How to sign in with a username or Google, including duplicate usernames.'], 3, [
    t('Anda bisa masuk dengan nama pengguna dan kata sandi, atau dengan Google. Simulasi di bawah hanya contoh: ia tidak meminta atau menyimpan kata sandi Anda.', 'You can sign in with a username and password, or with Google. The simulation below is only a demo: it never asks for or stores your password.'),
    st(['Langkah masuk', 'Sign-in steps'], [
      ['Buka akun.7mit.org', 'Open akun.7mit.org', 'Gunakan alamat resmi dan pastikan ada tanda gembok di peramban.', 'Use the official address and check for the padlock in your browser.'],
      ['Isi nama pengguna', 'Enter your username', 'Contoh: contoh atau contoh@7mit. Keduanya diterima.', 'Example: contoh or contoh@7mit. Both are accepted.'],
      ['Isi kata sandi lalu Masuk', 'Enter password and sign in', 'Kata sandi diketik hanya di halaman resmi.', 'Type your password only on the official page.'],
      ['Pilih akun bila diminta', 'Choose the account if asked', 'Jika nama pengguna dipakai lebih dari satu akun, server meminta Anda memilih.', 'If a username belongs to more than one account, the server asks you to choose.', 'Pilih sesuai peran Anda.', 'Choose by your role.'],
    ]),
    mock('login-akun', ['Demo: halaman masuk (bukan akun sungguhan)', 'Demo: sign-in page (not a real account)']),
    co('warning', 'Jangan pernah membagikan kata sandi kepada siapa pun, termasuk yang mengaku admin.', 'Never share your password with anyone, including people claiming to be admins.'),
    quiz(['Kuis cepat', 'Quick quiz'], [q('q1', ['Di mana sebaiknya Anda mengetik kata sandi?', 'Where should you type your password?'], ['Hanya di halaman resmi akun.7mit.org.', 'Only on the official akun.7mit.org page.'], [['Halaman resmi akun.7mit.org', 'The official akun.7mit.org page', true], ['Tautan dari pesan orang asing', 'A link from a stranger', false]])]),
  ], { popular: true, featured: true }),

  A('lupa-kata-sandi', 'akun', 'akun-keamanan', ['Lupa kata sandi? Pulihkan akun', 'Forgot your password? Recover your account'], ['Pulihkan akun lewat halaman resmi dan cari penyebab jika tidak berhasil.', 'Recover through the official page, and diagnose if it does not work.'], 3, [
    t('Pemulihan dilakukan di https://akun.7mit.org/forgot-pwd. Gunakan simulasi untuk melihat alurnya.', 'Recovery is done at https://akun.7mit.org/forgot-pwd. Use the simulation to see the flow.'),
    mock('recover-password', ['Demo alur pemulihan (tidak mengirim apa pun)', 'Recovery flow demo (sends nothing)']),
    {
      kind: 'troubleshoot', title: B('Tidak bisa masuk? Cari penyebabnya', 'Cannot sign in? Find the cause'), start: 'a',
      nodes: [
        { key: 'a', question: B('Apakah Anda masuk lewat Google?', 'Do you sign in with Google?'), answers: [{ label: B('Ya', 'Yes'), to: 'g' }, { label: B('Tidak', 'No'), to: 'b' }] },
        { key: 'g', result: B('Gunakan tombol Google di halaman masuk dan pilih akun Google yang terhubung ke akun 7 MIT Anda.', 'Use the Google button on the sign-in page and pick the Google account linked to your 7 MIT account.'), answers: [] },
        { key: 'b', question: B('Muncul pilihan akun setelah mengisi nama pengguna?', 'Did an account choice appear after your username?'), answers: [{ label: B('Ya', 'Yes'), to: 'c' }, { label: B('Tidak', 'No'), to: 'd' }] },
        { key: 'c', result: B('Nama pengguna dipakai lebih dari satu akun. Pilih akun dengan peran Anda, lalu masuk.', 'The username belongs to more than one account. Pick the account with your role, then sign in.'), answers: [] },
        { key: 'd', result: B('Kemungkinan kata sandi salah. Buka halaman lupa kata sandi untuk memulihkan.', 'The password is probably wrong. Open the forgot-password page to recover.'), answers: [], article: 'lupa-kata-sandi' },
      ],
    },
  ], { popular: true }),

  A('kelola-sesi-perangkat', 'akun', 'akun-keamanan', ['Kelola sesi dan perangkat', 'Manage sessions and devices'], ['Lihat perangkat yang sedang masuk dan keluarkan yang tidak dikenal.', 'See signed-in devices and sign out ones you do not recognise.'], 2, [
    t('Jika ada perangkat tidak dikenal, keluarkan sesinya dan ganti kata sandi.', 'If a device looks unfamiliar, end its session and change your password.'),
    mock('sessions-devices', ['Demo daftar perangkat (data contoh)', 'Device list demo (sample data)']),
    dia('auth-flow', ['Alur masuk', 'Sign-in flow'], ['Dari formulir sampai sesi aktif di server.', 'From the form to an active session on the server.']),
  ]),

  A('memulai-oneclass', 'oneclass', 'belajar', ['Memulai OneClass.7MIT', 'Getting started with OneClass.7MIT'], ['Satu portal untuk siswa, guru, dan pengurus. Tampilan mengikuti peran akun.', 'One portal for students, teachers, and officers. The view follows your role.'], 4, [
    t('OneClass menggabungkan portal siswa, guru, dan pengurus. Setelah masuk, mode ditentukan oleh tipe dan peran akun Anda di server.', 'OneClass merges the student, teacher, and officer portals. After sign-in, your mode is set by your account type and role on the server.'),
    mock('oneclass-dashboard', ['Demo dasbor (data contoh)', 'Dashboard demo (sample data)']),
    dia('role-access', ['Siapa melihat apa', 'Who sees what'], ['Antarmuka hanya menampilkan; server yang menegakkan izin.', 'The interface only displays; the server enforces permissions.']),
    quiz(['Cek pemahaman', 'Check your understanding'], [q('q1', ['Siapa yang menentukan apa yang boleh Anda lakukan?', 'Who decides what you may do?'], ['Server memeriksa peran Anda di setiap permintaan.', 'The server checks your role on every request.'], [['Server', 'The server', true], ['Hanya tampilan tombol', 'Only which buttons are shown', false]])]),
  ], { featured: true, popular: true }),

  A('login-google-oneclass', 'oneclass', 'akun-keamanan', ['Masuk ke OneClass dengan Google', 'Sign in to OneClass with Google'], ['Masuk lewat Google dan apa yang terjadi di balik layar.', 'Sign in via Google and what happens behind the scenes.'], 3, [
    t('Tombol Google mengalihkan Anda ke Google, lalu kembali ke OneClass. Setelah itu OneClass menyiapkan ruang kerja sesuai peran.', 'The Google button sends you to Google and back to OneClass, which then prepares your workspace by role.'),
    { kind: 'flow', title: B('Alur masuk Google', 'Google sign-in flow'), alt: B('Diagram alur dari OneClass ke Google lalu kembali.', 'Diagram from OneClass to Google and back.'), nodes: [
      { key: 'u', label: B('Anda', 'You'), text: B('Menekan tombol Google', 'Press the Google button'), x: 0, y: 80, tone: 'start' },
      { key: 'g', label: B('Google', 'Google'), text: B('Memverifikasi akun Google', 'Verifies the Google account'), x: 260, y: 0 },
      { key: 'a', label: B('akun.7mit', 'akun.7mit'), text: B('Menautkan ke akun 7 MIT', 'Links to your 7 MIT account'), x: 520, y: 80 },
      { key: 'o', label: B('OneClass', 'OneClass'), text: B('Menyiapkan ruang kerja', 'Prepares the workspace'), x: 780, y: 0, tone: 'end' },
    ], edges: [{ from: 'u', to: 'g' }, { from: 'g', to: 'a', label: B('berhasil', 'success') }, { from: 'a', to: 'o' }] },
    co('info', 'Jika layar tertahan di “Menyiapkan OneClass…”, muat ulang halaman dan masuk lagi.', 'If the screen stays on “Preparing OneClass…”, reload and sign in again.'),
  ]),

  A('intelligence-asisten-ai', 'intelligence', 'ai', ['Memakai intelligence.7mit', 'Using intelligence.7mit'], ['Tanya, analisis berkas, dan ubah jawaban jadi grafik.', 'Ask, analyse files, and turn answers into charts.'], 3, [
    t('intelligence.7mit adalah asisten AI untuk berpikir, belajar, dan menciptakan. Contoh di bawah adalah simulasi, bukan jawaban dari model sungguhan.', 'intelligence.7mit is an AI assistant for thinking, learning, and creating. The example below is a simulation, not a real model answer.'),
    mock('ai-chat', ['Demo obrolan (jawaban contoh)', 'Chat demo (sample answers)']),
    dia('ai-generation', ['Bagaimana jawaban dibuat', 'How an answer is generated'], ['Pertanyaan → konteks → model → jawaban.', 'Question → context → model → answer.']),
    co('tip', 'Periksa kembali fakta penting dari jawaban AI sebelum dipakai.', 'Double-check important facts from AI answers before using them.'),
  ], { popular: true, featured: true }),

  A('kuis-guru-dan-siswa', 'quiz', 'belajar', ['Kuis: membuat dan mengikuti', 'Quizzes: create and join'], ['Guru membuat kuis, siswa bergabung dan menjawab.', 'Teachers create quizzes; students join and answer.'], 4, [
    t('Layanan kuis berstatus beta. Alur di bawah menggambarkan cara pakai umum; tampilannya bisa berubah.', 'The quiz service is in beta. The flow below shows typical use; screens may change.'),
    mock('quiz-join', ['Demo bergabung ke kuis (kode contoh)', 'Join-a-quiz demo (sample code)']),
    mock('quiz-answer', ['Demo menjawab soal', 'Answering demo']),
    dia('quiz-submit', ['Dari jawaban ke skor', 'From answer to score'], ['Jawaban dikirim lalu dinilai.', 'Answers are submitted, then scored.']),
  ]),

  A('memendekkan-tautan', 'link', 'produktivitas', ['Memendekkan tautan dengan link.7mit', 'Shorten links with link.7mit'], ['Buat tautan ringkas, QR, dan halaman personal.', 'Create short links, QR codes, and personal pages.'], 3, [
    mock('link-shorten', ['Demo pemendek tautan (tidak membuat tautan nyata)', 'Link shortener demo (creates no real link)']),
    dia('short-url', ['Cara tautan pendek bekerja', 'How a short link works'], ['Tautan pendek diarahkan ke alamat panjang.', 'A short link is redirected to the long address.']),
  ]),

  A('anggaran-transparansi', 'anggaran', 'transparansi', ['Membaca anggaran di anggaran.7mit', 'Reading the budget on anggaran.7mit'], ['Lihat pemasukan dan pengeluaran APBK secara transparan.', 'View APBK income and spending transparently.'], 3, [
    t('Angka pada grafik ini contoh untuk belajar membaca, bukan data anggaran yang sebenarnya.', 'The numbers in this chart are examples for learning how to read it, not real budget data.'),
    mock('anggaran-explorer', ['Demo penjelajah anggaran (DATA UJI)', 'Budget explorer demo (TEST DATA)']),
    { kind: 'chart', chart: 'bar', title: B('Contoh pemasukan vs pengeluaran (DATA UJI)', 'Example income vs spending (TEST DATA)'), demo: true, unit: 'Rp', points: [{ label: B('Pemasukan', 'Income'), value: 1000000 }, { label: B('Pengeluaran', 'Spending'), value: 650000 }, { label: B('Sisa', 'Remaining'), value: 350000 }], note: B('Data uji untuk ilustrasi.', 'Test data for illustration.') },
  ]),

  A('status-layanan', 'status', 'transparansi', ['Memeriksa status layanan', 'Checking service status'], ['Cek apakah sebuah layanan sedang bermasalah.', 'Check whether a service is having problems.'], 2, [
    mock('status-board', ['Demo papan status (data contoh)', 'Status board demo (sample data)']),
    { kind: 'troubleshoot', title: B('Layanan terasa lambat?', 'Service feels slow?'), start: 'a', nodes: [
      { key: 'a', question: B('Apakah halaman status menunjukkan gangguan?', 'Does the status page show an incident?'), answers: [{ label: B('Ya', 'Yes'), to: 'b' }, { label: B('Tidak', 'No'), to: 'c' }] },
      { key: 'b', result: B('Tunggu sampai pulih. Tim sudah mengetahuinya.', 'Wait until it recovers. The team is aware.'), answers: [] },
      { key: 'c', result: B('Coba muat ulang dan periksa koneksi internet Anda. Jika berlanjut, hubungi halo@7mit.org.', 'Try reloading and check your connection. If it persists, contact halo@7mit.org.'), answers: [] },
    ] },
  ]),

  A('whiteboard-dasar', 'whiteboard', 'belajar', ['Dasar-dasar whiteboard.7mit', 'whiteboard.7mit basics'], ['Alat gambar dasar untuk menjelaskan pelajaran.', 'Basic drawing tools for explaining lessons.'], 2, [
    mock('whiteboard-tools', ['Demo alat papan tulis (simulasi)', 'Whiteboard tools demo (simulation)']),
  ]),

  A('server-7mit-data', 'server', 'infrastruktur', ['Apa itu server.7mit', 'What is server.7mit'], ['Pusat data tempat layanan menyimpan dan membaca data.', 'The data hub where services store and read data.'], 3, [
    dia('client-server', ['Klien dan server', 'Client and server'], ['Antarmuka meminta, server memeriksa izin lalu menjawab.', 'The interface asks, the server checks permission, then answers.']),
    dia('data-flow', ['Aliran data', 'Data flow'], ['Data per tabel, bukan satu berkas besar.', 'Data in per-purpose tables, not one big file.']),
  ]),

  A('trustlayer-pemeriksaan', 'trustlayer', 'infrastruktur', ['TrustLayer: server yang menegakkan', 'TrustLayer: the server enforces'], ['Empat fungsi: hak akses, konsistensi data, konfigurasi, pencatatan.', 'Four functions: access rights, data consistency, configuration, logging.'], 4, [
    t('TrustLayer memeriksa dan mencatat. Server tetap yang menegakkan izin di setiap permintaan.', 'TrustLayer checks and logs. The server still enforces permission on every request.'),
    dia('role-access', ['Aturan peran', 'Role rules'], ['Siswa hanya melihat miliknya; pengelola sesuai peran.', 'Students see only their own; managers by role.']),
    { kind: 'timeline', title: B('Empat fungsi', 'Four functions'), events: [
      { title: B('1. Hak akses', '1. Access rights'), text: B('Memeriksa peran dan kepemilikan data.', 'Checks role and data ownership.') },
      { title: B('2. Konsistensi data', '2. Data consistency'), text: B('Mencari data yang tidak cocok.', 'Finds mismatched data.') },
      { title: B('3. Konfigurasi', '3. Configuration'), text: B('Memastikan versi dan mode sesuai.', 'Ensures version and mode match.') },
      { title: B('4. Pencatatan', '4. Logging'), text: B('Hasil disimpan untuk ditindaklanjuti.', 'Results are stored for follow-up.') },
    ] },
  ]),

  A('forms-formulir', 'forms', 'produktivitas', ['forms.7mit (rancangan)', 'forms.7mit (draft)'], ['Rancangan layanan formulir; belum tersedia.', 'Draft of the forms service; not available yet.'], 2, [DRAFT, mock('form-fill', ['Gambaran rancangan (bukan layanan nyata)', 'Concept preview (not a real service)'])], { draft: true }),
  A('cloud-penyimpanan', 'cloud', 'infrastruktur', ['cloud.7mit (rancangan)', 'cloud.7mit (draft)'], ['Rancangan penyimpanan berkas; belum tersedia.', 'Draft of file storage; not available yet.'], 2, [DRAFT, dia('cloud-storage', ['Gambaran penyimpanan', 'Storage concept'], ['Ilustrasi rancangan.', 'Illustration of the plan.']), mock('file-manager', ['Gambaran rancangan', 'Concept preview'])], { draft: true }),
  A('hosting-situs', 'hosting', 'infrastruktur', ['hosting.7mit (rancangan)', 'hosting.7mit (draft)'], ['Rancangan hosting situs; belum tersedia.', 'Draft of site hosting; not available yet.'], 2, [DRAFT, dia('static-vs-dynamic', ['Situs statis vs dinamis', 'Static vs dynamic sites'], ['Konsep umum, bukan fitur layanan.', 'General concept, not a service feature.']), mock('deploy-wizard', ['Gambaran rancangan', 'Concept preview'])], { draft: true }),
  A('display-papan-tampilan', 'display', 'produktivitas', ['display.7mit (rancangan)', 'display.7mit (draft)'], ['Rancangan papan tampilan kelas; belum tersedia.', 'Draft of the classroom display; not available yet.'], 2, [DRAFT, mock('display-board', ['Gambaran rancangan', 'Concept preview'])], { draft: true }),
  A('belajar-lms', 'belajar', 'belajar', ['belajar.7mit: LMS dan informasi sekolah', 'belajar.7mit: LMS and school info'], ['Materi, tugas, nilai, jadwal, dan kehadiran dalam satu layanan.', 'Materials, assignments, grades, schedule, and attendance in one service.'], 3, [
    t('Layanan ini beta dan tersaji di social.7mit.org saat ini.', 'This service is beta and currently served at social.7mit.org.'),
    dia('data-flow', ['Terhubung ke server.7mit', 'Connected to server.7mit'], ['Data akademik dibaca dari server.', 'Academic data is read from the server.']),
  ]),
];
