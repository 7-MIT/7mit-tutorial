// Artikel tambahan. Hanya fitur yang sudah terverifikasi atau konsep umum; demo memakai data contoh.
const B = (id, en) => ({ id, en });
const t = (id, en) => ({ kind: 'text', text: B(id, en) });
const h = (id, en) => ({ kind: 'heading', level: 2, text: B(id, en) });
const co = (tone, id, en) => ({ kind: 'callout', tone, text: B(id, en) });
const ls = (ordered, items) => ({ kind: 'list', ordered, items: items.map(([a, b]) => B(a, b)) });
const st = (title, steps) => ({ kind: 'steps', title: B(...title), steps: steps.map(([a, b, c, d]) => ({ title: B(a, b), text: B(c, d) })) });
const mock = (preset, cap) => ({ kind: 'mock', preset, caption: B(...cap) });
const dia = (preset, title, cap) => ({ kind: 'diagram', preset, title: B(...title), caption: B(...cap) });
const q1 = (tt, ex, opts) => ({ kind: 'quiz', title: B('Cek pemahaman', 'Check your understanding'), questions: [{ key: 'q1', text: B(...tt), explanation: B(...ex), options: opts.map(([a, b, c]) => ({ label: B(a, b), correct: !!c })) }] });
const tree = (title, nodes) => ({ kind: 'troubleshoot', title: B(...title), start: nodes[0][0], nodes: nodes.map(([key, qq, res, ans = []]) => ({ key, ...(qq ? { question: B(...qq) } : {}), ...(res ? { result: B(...res) } : {}), answers: ans.map(([l, to]) => ({ label: B(...l), to })) })) });
const YN = (y, n) => [[['Ya', 'Yes'], y], [['Tidak', 'No'], n]];
const A = (slug, service, category, title, summary, minutes, blocks, o = {}) => ({ slug, service, services: o.services ?? [service], category, title: B(...title), summary: B(...summary), status: 'published', verified: true, featured: false, popular: !!o.popular, minutes, createdAt: '2026-11-11T03:00:00Z', updatedAt: '2026-11-11T03:00:00Z', blocks });
const DEMO = (n) => [`Demo: ${n} (data contoh)`, `Demo: ${n} (sample data)`];

export const articles2 = [
  A('oneclass-ringkasan', 'oneclass', 'belajar', ['Membaca halaman Ringkasan OneClass', 'Reading the OneClass Overview'], ['Ringkasan menampilkan hal terpenting untuk peran Anda dalam satu layar.', 'The Overview shows what matters most for your role on one screen.'], 3, [
    t('Setelah masuk, Anda mendarat di Ringkasan. Isinya menyesuaikan tipe dan peran akun.', 'After sign-in you land on the Overview. Its content follows your account type and role.'),
    mock('oneclass-dashboard', DEMO('Ringkasan')),
    st(['Cara memakai Ringkasan', 'How to use the Overview'], [['Lihat jadwal hari ini', 'Check today’s schedule', 'Kartu jadwal menunjukkan pelajaran sesuai jam.', 'The schedule card lists lessons by time.'], ['Buka bagian lain', 'Open other sections', 'Pilih menu untuk Iuran, Kuis, atau lainnya yang tersedia untuk peran Anda.', 'Pick a menu such as Dues or Quiz, whichever your role allows.']]),
  ], { popular: true }),
  A('oneclass-jadwal', 'oneclass', 'belajar', ['Melihat jadwal pelajaran', 'Viewing the lesson schedule'], ['Singkatan mata pelajaran dan cara membaca jadwal.', 'Subject abbreviations and how to read the schedule.'], 2, [
    t('Jadwal menampilkan pelajaran sesuai jam. Beberapa singkatan: AGM berarti Agama, dan PBP berarti Character Education.', 'The schedule lists lessons by time. Some abbreviations: AGM means Religion, and PBP means Character Education.'),
    { kind: 'compare', title: B('Singkatan', 'Abbreviations'), columns: [B('Singkatan', 'Short'), B('Artinya', 'Meaning')], rows: [{ label: B('AGM', 'AGM'), cells: [B('AGM', 'AGM'), B('Agama', 'Religion')] }, { label: B('PBP', 'PBP'), cells: [B('PBP', 'PBP'), B('Character Education', 'Character Education')] }] },
    mock('oneclass-dashboard', DEMO('Jadwal')),
  ]),
  A('oneclass-iuran-siswa', 'oneclass', 'belajar', ['Melihat iuran sebagai siswa', 'Viewing your dues as a student'], ['Siswa hanya melihat iuran miliknya sendiri.', 'Students only see their own dues.'], 3, [
    t('Di mode siswa, Anda hanya melihat iuran milik Anda. Server menolak permintaan atas data siswa lain.', 'In student mode you only see your own dues. The server rejects requests for other students’ data.'),
    mock('anggaran-explorer', DEMO('Iuran (DATA UJI)')),
    dia('role-access', ['Mengapa hanya milik sendiri', 'Why only your own'], ['Aturan peran dicek di server pada tiap permintaan.', 'Role rules are checked on the server on every request.']),
    q1(['Bolehkah siswa melihat iuran teman?', 'May a student view a friend’s dues?'], ['Tidak. Siswa hanya melihat miliknya.', 'No. Students only see their own.'], [['Tidak', 'No', true], ['Boleh', 'Yes', false]]),
  ], { popular: true }),
  A('oneclass-invoice-publik', 'oneclass', 'belajar', ['Membuka bukti pembayaran (invoice)', 'Opening a payment receipt (invoice)'], ['Setiap bukti punya tautan publik berformat /invoice/nomor-struk.', 'Each receipt has a public link of the form /invoice/receipt-number.'], 2, [
    t('Bukti pembayaran dapat dibuka lewat tautan one.7mit.org/invoice/[nomor-struk]. Siapa pun yang memegang tautan dapat melihatnya, jadi bagikan dengan hati-hati.', 'A receipt opens at one.7mit.org/invoice/[receipt-number]. Anyone with the link can view it, so share it carefully.'),
    st(['Membuka invoice', 'Opening an invoice'], [['Salin nomor struk', 'Copy the receipt number', 'Nomor tertera pada bukti pembayaran.', 'The number is printed on the receipt.'], ['Buka tautan', 'Open the link', 'Ganti [nomor-struk] pada alamat dengan nomor Anda.', 'Replace [receipt-number] in the address with yours.']]),
    co('warning', 'Tautan invoice bersifat publik. Jangan menaruhnya di tempat umum.', 'Invoice links are public. Do not post them publicly.'),
  ]),
  A('oneclass-mode-siswa', 'oneclass', 'belajar', ['Mode Siswa di OneClass', 'Student mode in OneClass'], ['Apa yang tersedia untuk akun siswa.', 'What is available to student accounts.'], 2, [
    t('Akun bertipe siswa membuka mode Siswa: jadwal, iuran sendiri, dan kuis.', 'Accounts of type student open Student mode: schedule, own dues, and quizzes.'),
    dia('role-access', ['Aturan untuk siswa', 'Rules for students'], ['Hanya data milik sendiri.', 'Only your own data.']),
  ]),
  A('oneclass-mode-guru', 'oneclass', 'belajar', ['Mode Guru di OneClass', 'Teacher mode in OneClass'], ['Peran guru menentukan kewenangan, mis. Guru Kelas atau Akun Resmi.', 'The teacher role sets authority, e.g. Class Teacher or Official Account.'], 3, [
    t('Akun bertipe guru membuka mode Guru. Kewenangan tambahan bergantung pada peran, misalnya Guru Kelas boleh mengubah iuran, sedangkan Akun Resmi juga dapat membuka TrustLayer.', 'Teacher accounts open Teacher mode. Extra authority depends on role: a Class Teacher may change dues, and the Official Account can also open TrustLayer.'),
    dia('role-access', ['Peran menentukan izin', 'Role decides permission'], ['Server membaca peran Anda.', 'The server reads your role.']),
    q1(['Apa yang menentukan kewenangan guru?', 'What sets a teacher’s authority?'], ['Peran akun di server.', 'The account role on the server.'], [['Peran akun', 'Account role', true], ['Warna tema', 'Theme color', false]]),
  ]),
  A('oneclass-mode-pengurus', 'oneclass', 'belajar', ['Mode Pengurus di OneClass', 'Officer mode in OneClass'], ['Peran pengurus (Bendahara, Sekretariat, Presiden) memengaruhi izin.', 'Officer roles (Treasurer, Secretariat, President) affect permission.'], 3, [
    t('Akun pengurus membuka mode Pengurus. Contoh: Bendahara dapat mengubah iuran, Sekretariat tidak, dan Presiden dapat membuka TrustLayer.', 'Officer accounts open Officer mode. Example: Treasurers may change dues, Secretariat may not, and the President can open TrustLayer.'),
    dia('role-access', ['Izin per peran', 'Permission per role'], ['Izin dicek di server.', 'Permissions are checked on the server.']),
  ]),
  A('oneclass-catat-iuran', 'oneclass', 'belajar', ['Mencatat iuran (untuk pengelola)', 'Recording dues (for managers)'], ['Pengelola dengan izin dapat mencatat pembayaran, mis. tunai.', 'Managers with permission can record payments, e.g. cash.'], 3, [
    t('Hanya peran dengan izin ubah iuran yang dapat mencatat pembayaran. Server menolak peran lain walau tombolnya terlihat.', 'Only roles with permission to change dues can record payments. The server refuses other roles even if a button shows.'),
    st(['Mencatat pembayaran', 'Recording a payment'], [['Pilih siswa dan periode', 'Pick student and period', 'Cari nama siswa lalu pilih periode iuran.', 'Find the student and choose the dues period.'], ['Pilih cara bayar', 'Choose payment method', 'Contoh: tunai.', 'For example: cash.'], ['Simpan', 'Save', 'Sistem membuat bukti pembayaran dengan nomor struk.', 'The system creates a receipt with a receipt number.']]),
    mock('anggaran-explorer', DEMO('Catat iuran (DATA UJI)')),
  ]),
  A('oneclass-dari-portal-lama', 'oneclass', 'mulai', ['Pindah dari portal lama ke OneClass', 'Moving from the old portals to OneClass'], ['Portal siswa, guru, dan pengurus digantikan satu portal.', 'The student, teacher, and officer portals are replaced by one portal.'], 3, [
    t('Portal siswa.7mit, guru.7mit, dan pengurus.7mit masih berjalan, tetapi OneClass menyatukan ketiganya. Gunakan akun yang sama.', 'The siswa.7mit, guru.7mit, and pengurus.7mit portals still run, but OneClass unifies the three. Use the same account.'),
    { kind: 'compare', title: B('Lama vs baru', 'Old vs new'), columns: [B('Portal lama', 'Old portals'), B('OneClass', 'OneClass')], rows: [{ label: B('Alamat', 'Address'), cells: [B('Tiga alamat terpisah', 'Three separate addresses'), B('one.7mit.org', 'one.7mit.org')] }, { label: B('Mode', 'Mode'), cells: [B('Satu portal per peran', 'One portal per role'), B('Mode mengikuti peran akun', 'Mode follows account role')] }] },
    st(['Pindah ke OneClass', 'Move to OneClass'], [['Buka one.7mit.org', 'Open one.7mit.org', 'Gunakan alamat resmi.', 'Use the official address.'], ['Masuk dengan akun yang sama', 'Sign in with the same account', 'Nama pengguna dan kata sandi tidak berubah.', 'Your username and password do not change.'], ['Periksa mode Anda', 'Check your mode', 'Mode mengikuti tipe dan peran akun.', 'The mode follows your account type and role.']]),
  ]),
  A('oneclass-tetap-masuk', 'oneclass', 'akun-keamanan', ['Sesi: mengapa tetap masuk', 'Sessions: why you stay signed in'], ['Sesi menyimpan token agar tidak perlu masuk berulang.', 'A session keeps a token so you need not sign in repeatedly.'], 2, [
    t('Setelah masuk, perangkat menyimpan token sesi. Server memeriksa token tiap permintaan. Keluar mencabut sesi.', 'After sign-in the device keeps a session token. The server checks it on each request. Signing out revokes the session.'),
    dia('auth-flow', ['Dari masuk ke sesi', 'From sign-in to session'], ['Token menjaga Anda tetap masuk.', 'The token keeps you signed in.']),
    co('tip', 'Di perangkat bersama, selalu keluar setelah selesai.', 'On shared devices always sign out when done.'),
  ]),
  A('akun-nama-pengguna-ganda', 'akun', 'akun-keamanan', ['Nama pengguna dipakai lebih dari satu akun', 'A username used by more than one account'], ['Server meminta Anda memilih akun yang dimaksud.', 'The server asks you to choose which account you mean.'], 2, [
    t('Kadang satu nama pengguna ada pada beberapa akun, misalnya siswa dan pengurus. Setelah kata sandi benar, Anda diminta memilih akun.', 'Sometimes one username exists on several accounts, e.g. student and officer. After a correct password you are asked to choose.'),
    mock('login-akun', DEMO('Pilih akun')),
    tree(['Tidak yakin akun mana?', 'Not sure which account?'], [['a', ['Anda ingin melihat data pribadi (iuran, jadwal)?', 'Do you want personal data (dues, schedule)?'], null, YN('s', 'p')], ['s', null, ['Pilih akun bertipe siswa.', 'Pick the student-type account.']], ['p', null, ['Pilih akun sesuai tugas pengelolaan Anda (guru atau pengurus).', 'Pick the account for your management duty (teacher or officer).']]]),
  ]),
  A('akun-tautkan-google', 'akun', 'akun-keamanan', ['Menautkan akun Google', 'Linking your Google account'], ['Setelah menautkan, Anda bisa masuk dengan tombol Google.', 'Once linked, you can sign in with the Google button.'], 3, [
    t('Masuk sekali dengan nama pengguna dan kata sandi, lalu tautkan Google. Berikutnya cukup tekan tombol Google.', 'Sign in once with username and password, then link Google. After that, just press the Google button.'),
    { kind: 'flow', title: B('Alur menautkan', 'Linking flow'), alt: B('Dari masuk biasa ke penautan Google.', 'From normal sign-in to Google linking.'), nodes: [{ key: 'a', label: B('Masuk biasa', 'Normal sign-in'), text: B('Nama pengguna dan kata sandi.', 'Username and password.'), x: 0, y: 40, tone: 'start' }, { key: 'b', label: B('Pilih Google', 'Choose Google'), text: B('Pilih akun Google Anda.', 'Pick your Google account.'), x: 260, y: 0 }, { key: 'c', label: B('Tertaut', 'Linked'), text: B('Berikutnya masuk dengan Google.', 'Next time sign in with Google.'), x: 520, y: 40, tone: 'end' }], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }] },
  ]),
  A('akun-kata-sandi-kuat', 'akun', 'akun-keamanan', ['Membuat kata sandi yang kuat', 'Creating a strong password'], ['Panjang dan unik lebih penting daripada rumit.', 'Long and unique beats complicated.'], 3, [
    ls(false, [['Panjang: 12 karakter atau lebih.', 'Long: 12 characters or more.'], ['Unik: jangan dipakai di layanan lain.', 'Unique: never reuse it elsewhere.'], ['Jangan memuat nama, tanggal lahir, atau “12345”.', 'No names, birth dates, or “12345”.']]),
    { kind: 'chart', chart: 'bar', title: B('Contoh: waktu menebak sandi (ilustrasi)', 'Example: time to guess a password (illustration)'), demo: true, unit: 'tahun', points: [{ label: B('6 karakter', '6 chars'), value: 0.001 }, { label: B('10 karakter', '10 chars'), value: 5 }, { label: B('14 karakter', '14 chars'), value: 5000 }], note: B('Angka ilustrasi untuk menunjukkan tren, bukan hasil pengukuran.', 'Illustrative numbers to show the trend, not measurements.') },
    q1(['Mana yang lebih kuat?', 'Which is stronger?'], ['Frasa panjang yang unik lebih sulit ditebak.', 'A long unique phrase is harder to guess.'], [['Frasa panjang yang unik', 'A long unique phrase', true], ['Kata pendek dengan simbol', 'A short word with symbols', false]]),
  ], { popular: true }),
  A('akun-keluar-aman', 'akun', 'akun-keamanan', ['Keluar dengan aman', 'Signing out safely'], ['Keluar mencabut sesi di perangkat ini.', 'Signing out revokes the session on this device.'], 2, [
    st(['Langkah keluar', 'Sign-out steps'], [['Buka menu akun', 'Open the account menu', 'Biasanya di pojok kanan atas.', 'Usually at the top right.'], ['Pilih Keluar', 'Choose Sign out', 'Sesi dicabut di server.', 'The session is revoked on the server.'], ['Tutup tab', 'Close the tab', 'Terutama di perangkat bersama.', 'Especially on shared devices.']]),
    mock('sessions-devices', DEMO('Perangkat')),
  ]),
  A('akun-gembok-https', 'akun', 'akun-keamanan', ['Gembok dan HTTPS: memastikan halaman resmi', 'Padlock and HTTPS: checking the official page'], ['Cek alamat sebelum mengetik kata sandi.', 'Check the address before typing a password.'], 3, [
    t('Alamat resmi dimulai dengan https:// dan berakhir di .7mit.org. Jangan percaya tampilan saja; baca alamatnya.', 'Official addresses start with https:// and end in .7mit.org. Do not trust looks alone; read the address.'),
    { kind: 'compare', title: B('Resmi vs mencurigakan', 'Official vs suspicious'), columns: [B('Resmi', 'Official'), B('Mencurigakan', 'Suspicious')], rows: [{ label: B('Alamat', 'Address'), cells: [B('https://akun.7mit.org', 'https://akun.7mit.org'), B('akun-7mit.login-aman.example', 'akun-7mit.login-aman.example')] }, { label: B('Sambungan', 'Connection'), cells: [B('HTTPS', 'HTTPS'), B('HTTP atau peringatan', 'HTTP or a warning')] }] },
    q1(['Alamat mana yang resmi?', 'Which address is official?'], ['Domain utamanya harus 7mit.org.', 'The main domain must be 7mit.org.'], [['akun.7mit.org', 'akun.7mit.org', true], ['7mit.org.login-aman.example', '7mit.org.login-aman.example', false]]),
  ]),
  A('keamanan-phishing', 'akun', 'akun-keamanan', ['Mengenali phishing', 'Recognising phishing'], ['Pesan yang menyamar untuk mencuri kata sandi.', 'Messages that pose as someone to steal passwords.'], 3, [
    ls(true, [['Pesan mendesak (“akun diblokir hari ini”).', 'Urgent messages (“account blocked today”).'], ['Tautan ke alamat yang bukan .7mit.org.', 'Links to addresses that are not .7mit.org.'], ['Meminta kata sandi lewat chat atau email.', 'Asking for a password by chat or email.']]),
    tree(['Pesan ini mencurigakan?', 'Is this message suspicious?'], [['a', ['Apakah meminta kata sandi?', 'Does it ask for your password?'], null, YN('x', 'b')], ['b', ['Apakah tautannya bukan 7mit.org?', 'Is the link not on 7mit.org?'], null, YN('x', 'ok')], ['x', null, ['Jangan klik. Laporkan ke halo@7mit.org.', 'Do not click. Report it to halo@7mit.org.']], ['ok', null, ['Tetap hati-hati. Buka layanan lewat alamat yang Anda ketik sendiri.', 'Stay careful. Open the service via an address you type yourself.']]]),
  ], { popular: true }),
  A('keamanan-data-pribadi', 'server', 'akun-keamanan', ['Menjaga data pribadi', 'Protecting personal data'], ['Apa yang tersimpan dan bagaimana menjaganya.', 'What is stored and how to protect it.'], 3, [
    ls(false, [['Bagikan seperlunya; jangan memasang tangkapan layar yang memuat data pribadi.', 'Share only what is needed; do not post screenshots with personal data.'], ['Tautan invoice bersifat publik.', 'Invoice links are public.'], ['Keluar di perangkat bersama.', 'Sign out on shared devices.']]),
    dia('data-flow', ['Data lewat server', 'Data goes through the server'], ['Server memeriksa izin sebelum memberi data.', 'The server checks permission before returning data.']),
  ]),
  A('trustlayer-membaca-catatan', 'trustlayer', 'infrastruktur', ['Membaca catatan TrustLayer', 'Reading TrustLayer records'], ['Jenis catatan: lolos, pelanggaran akses, beda data, beda konfigurasi, koneksi gagal.', 'Record kinds: passed, access violation, data difference, config difference, failed connection.'], 4, [
    t('Pengelola dengan izin dapat membuka catatan TrustLayer. Tiap catatan punya jenis dan status terbuka atau selesai.', 'Managers with permission can open TrustLayer records. Each record has a kind and an open or resolved status.'),
    { kind: 'compare', title: B('Jenis catatan', 'Record kinds'), columns: [B('Jenis', 'Kind'), B('Artinya', 'Meaning')], rows: [{ label: B('passed', 'passed'), cells: [B('passed', 'passed'), B('Pemeriksaan sesuai aturan', 'Check matched the rules')] }, { label: B('access_violation', 'access_violation'), cells: [B('access_violation', 'access_violation'), B('Keputusan akses menyimpang dari aturan', 'Access decision differed from the rules')] }, { label: B('data_diff', 'data_diff'), cells: [B('data_diff', 'data_diff'), B('Ada data yang tidak konsisten', 'Some data is inconsistent')] }, { label: B('config_diff', 'config_diff'), cells: [B('config_diff', 'config_diff'), B('Konfigurasi/versi berbeda', 'Configuration/version differs')] }, { label: B('connection_failed', 'connection_failed'), cells: [B('connection_failed', 'connection_failed'), B('Layanan tidak menjawab', 'A service did not answer')] }] },
    q1(['Catatan mana yang berarti antarmuka mengizinkan hal yang dilarang aturan?', 'Which record means the interface allowed something the rules forbid?'], ['access_violation: keputusan akses menyimpang dari aturan.', 'access_violation: the access decision differed from the rules.'], [['access_violation', 'access_violation', true], ['passed', 'passed', false]]),
  ]),
  A('trustlayer-aturan-peran', 'trustlayer', 'infrastruktur', ['Aturan peran di TrustLayer', 'Role rules in TrustLayer'], ['Matriks izin per tipe akun, peran, sumber daya, dan tindakan.', 'A permission matrix per account type, role, resource, and action.'], 3, [
    dia('role-access', ['Dari akun ke keputusan', 'From account to decision'], ['Aturan menentukan boleh atau ditolak.', 'Rules decide allow or deny.']),
    { kind: 'compare', title: B('Contoh aturan dasar', 'Sample baseline rules'), columns: [B('Peran', 'Role'), B('Ubah iuran', 'Change dues')], rows: [{ label: B('Siswa', 'Student'), cells: [B('Siswa', 'Student'), B('Tidak', 'No')] }, { label: B('Guru Kelas', 'Class Teacher'), cells: [B('Guru Kelas', 'Class Teacher'), B('Ya', 'Yes')] }, { label: B('Bendahara', 'Treasurer'), cells: [B('Bendahara', 'Treasurer'), B('Ya', 'Yes')] }, { label: B('Sekretariat', 'Secretariat'), cells: [B('Sekretariat', 'Secretariat'), B('Tidak', 'No')] }] },
  ]),
  A('trustlayer-jalankan-pemeriksaan', 'trustlayer', 'infrastruktur', ['Menjalankan pemeriksaan TrustLayer', 'Running a TrustLayer check'], ['Pemeriksaan penuh oleh pengelola: data, konfigurasi, koneksi, aturan.', 'A full check by a manager: data, configuration, connections, rules.'], 3, [
    st(['Menjalankan pemeriksaan', 'Running a check'], [['Buka TrustLayer', 'Open TrustLayer', 'Hanya terlihat untuk peran yang diizinkan.', 'Only visible to permitted roles.'], ['Jalankan pemeriksaan', 'Run the check', 'Server memeriksa data, konfigurasi, koneksi layanan, dan aturan.', 'The server checks data, configuration, service connections, and rules.'], ['Tinjau hasil', 'Review results', 'Tandai catatan selesai setelah ditindaklanjuti.', 'Mark records resolved once handled.']]),
    { kind: 'timeline', title: B('Yang diperiksa', 'What is checked'), events: [{ title: B('Konsistensi data', 'Data consistency'), text: B('Akun, daftar siswa, dan iuran.', 'Accounts, student list, and dues.') }, { title: B('Konfigurasi', 'Configuration'), text: B('Versi dan tipe akun.', 'Version and account types.') }, { title: B('Koneksi layanan', 'Service connections'), text: B('Fungsi server menjawab.', 'Server functions answer.') }, { title: B('Aturan akses', 'Access rules'), text: B('Matriks sesuai ketentuan dasar.', 'Matrix matches baseline rules.') }] },
  ]),
  A('intelligence-tips-bertanya', 'intelligence', 'ai', ['Tips bertanya yang baik ke AI', 'Tips for asking AI well'], ['Pertanyaan yang jelas menghasilkan jawaban yang berguna.', 'Clear questions get useful answers.'], 3, [
    st(['Resep pertanyaan', 'A question recipe'], [['Sebut tujuan', 'State the goal', 'Contoh: “Saya ingin belajar pecahan.”', 'Example: “I want to learn fractions.”'], ['Beri konteks', 'Give context', 'Kelas, bahan, atau batasan.', 'Grade, material, or limits.'], ['Minta bentuk jawaban', 'Ask for a format', 'Poin-poin, tabel, atau grafik.', 'Bullets, a table, or a chart.']]),
    mock('ai-chat', DEMO('Obrolan')),
    q1(['Mana pertanyaan yang lebih baik?', 'Which is the better question?'], ['Konteks dan bentuk jawaban membantu AI.', 'Context and format help the AI.'], [['Jelaskan pecahan untuk kelas 4 dengan 3 contoh', 'Explain fractions for grade 4 with 3 examples', true], ['Pecahan?', 'Fractions?', false]]),
  ]),
  A('intelligence-analisis-berkas', 'intelligence', 'ai', ['Menganalisis berkas dengan AI', 'Analysing files with AI'], ['Lampirkan berkas lalu tanyakan isinya.', 'Attach a file then ask about it.'], 3, [
    dia('ai-generation', ['Berkas jadi konteks', 'Files become context'], ['Isi berkas ditambahkan ke konteks pertanyaan.', 'File contents are added to the question context.']),
    co('warning', 'Jangan melampirkan berkas berisi kata sandi atau data pribadi yang tidak perlu.', 'Do not attach files with passwords or unnecessary personal data.'),
    mock('ai-chat', DEMO('Analisis berkas')),
  ]),
  A('intelligence-grafik', 'intelligence', 'ai', ['Mengubah jawaban menjadi grafik', 'Turning answers into charts'], ['Minta AI menyajikan angka sebagai grafik.', 'Ask the AI to present numbers as a chart.'], 2, [
    mock('ai-chat', DEMO('Grafik')),
    { kind: 'chart', chart: 'pie', title: B('Contoh grafik (DATA UJI)', 'Example chart (TEST DATA)'), demo: true, points: [{ label: B('Cahaya', 'Light'), value: 40 }, { label: B('Air', 'Water'), value: 35 }, { label: B('CO₂', 'CO₂'), value: 25 }], note: B('Angka ilustrasi.', 'Illustrative numbers.') },
  ]),
  A('link-qr-halaman', 'link', 'produktivitas', ['QR dan halaman personal di link.7mit', 'QR codes and personal pages on link.7mit'], ['Selain memendekkan tautan, link.7mit menyediakan QR dan halaman personal.', 'Besides shortening links, link.7mit offers QR codes and personal pages.'], 3, [
    st(['Dari tautan ke QR', 'From link to QR'], [['Persingkat tautan', 'Shorten the link', 'Tempel URL panjang lalu persingkat.', 'Paste a long URL then shorten it.'], ['Buat QR', 'Create a QR', 'QR menunjuk ke tautan pendek yang sama.', 'The QR points to the same short link.']]),
    mock('link-shorten', DEMO('Pemendek tautan')),
  ]),
  A('whiteboard-menjelaskan', 'whiteboard', 'belajar', ['Menjelaskan pelajaran dengan whiteboard', 'Explaining lessons with the whiteboard'], ['Tips memakai papan tulis digital untuk mengajar.', 'Tips for teaching with the digital whiteboard.'], 3, [
    st(['Alur mengajar', 'Teaching flow'], [['Siapkan kanvas', 'Prepare the canvas', 'Mulai dengan judul materi.', 'Start with the topic title.'], ['Gambar bertahap', 'Draw step by step', 'Satu ide per langkah agar mudah diikuti.', 'One idea per step so it is easy to follow.'], ['Tutup dengan ringkasan', 'Close with a summary', 'Tulis tiga poin utama.', 'Write three key points.']]),
    mock('whiteboard-tools', DEMO('Alat papan tulis')),
  ]),
  A('anggaran-memahami-apbk', 'anggaran', 'transparansi', ['Memahami istilah APBK', 'Understanding APBK terms'], ['Pemasukan, pengeluaran, dan sisa saldo.', 'Income, spending, and remaining balance.'], 3, [
    { kind: 'compare', title: B('Istilah', 'Terms'), columns: [B('Istilah', 'Term'), B('Arti', 'Meaning')], rows: [{ label: B('Pemasukan', 'Income'), cells: [B('Pemasukan', 'Income'), B('Uang yang masuk', 'Money coming in')] }, { label: B('Pengeluaran', 'Spending'), cells: [B('Pengeluaran', 'Spending'), B('Uang yang dipakai', 'Money used')] }, { label: B('Sisa', 'Balance'), cells: [B('Sisa', 'Balance'), B('Pemasukan dikurangi pengeluaran', 'Income minus spending')] }] },
    { kind: 'chart', chart: 'bar', title: B('Contoh (DATA UJI)', 'Example (TEST DATA)'), demo: true, unit: 'Rp', points: [{ label: B('Pemasukan', 'Income'), value: 500000 }, { label: B('Pengeluaran', 'Spending'), value: 200000 }, { label: B('Sisa', 'Balance'), value: 300000 }] },
    q1(['Bagaimana menghitung sisa?', 'How is the balance computed?'], ['Sisa = pemasukan − pengeluaran.', 'Balance = income − spending.'], [['Pemasukan − pengeluaran', 'Income − spending', true], ['Pemasukan + pengeluaran', 'Income + spending', false]]),
  ]),
  A('status-membaca-insiden', 'status', 'transparansi', ['Membaca insiden di halaman status', 'Reading incidents on the status page'], ['Arti status operasional, gangguan, dan pemeliharaan.', 'What operational, incident, and maintenance mean.'], 2, [
    { kind: 'timeline', title: B('Siklus insiden', 'Incident life cycle'), events: [{ title: B('Diselidiki', 'Investigating'), text: B('Tim mengetahui masalah.', 'The team knows about the issue.') }, { title: B('Teridentifikasi', 'Identified'), text: B('Penyebab ditemukan.', 'The cause is found.') }, { title: B('Dipantau', 'Monitoring'), text: B('Perbaikan diterapkan.', 'A fix is applied.') }, { title: B('Selesai', 'Resolved'), text: B('Layanan kembali normal.', 'Service is back to normal.') }] },
    mock('status-board', DEMO('Papan status')),
  ]),
  A('kuis-tips-guru', 'quiz', 'belajar', ['Tips guru membuat kuis yang baik', 'Tips for teachers writing good quizzes'], ['Soal singkat, pilihan jelas, dan penjelasan jawaban.', 'Short questions, clear options, and answer explanations.'], 3, [
    ls(true, [['Satu ide per soal.', 'One idea per question.'], ['Pilihan jawaban sama panjang.', 'Options of similar length.'], ['Beri penjelasan setelah menjawab.', 'Explain after answering.']]),
    mock('quiz-answer', DEMO('Soal')),
    q1(['Soal yang baik menguji…', 'A good question tests…'], ['Satu ide jelas.', 'One clear idea.'], [['Satu ide', 'One idea', true], ['Banyak ide sekaligus', 'Many ideas at once', false]]),
  ]),
  A('kuis-tips-siswa', 'quiz', 'belajar', ['Tips siswa mengikuti kuis', 'Tips for students taking quizzes'], ['Persiapan, kode kuis, dan menjawab dengan tenang.', 'Preparation, quiz code, and answering calmly.'], 2, [
    st(['Sebelum kuis', 'Before the quiz'], [['Siapkan akun', 'Prepare your account', 'Pastikan Anda bisa masuk.', 'Make sure you can sign in.'], ['Siapkan kode', 'Have the code ready', 'Kode dari guru.', 'The code from your teacher.'], ['Koneksi stabil', 'Stable connection', 'Hindari berpindah jaringan.', 'Avoid switching networks.']]),
    mock('quiz-join', DEMO('Gabung kuis')),
  ]),
  A('belajar-materi-tugas', 'belajar', 'belajar', ['Materi, tugas, dan nilai di belajar.7mit', 'Materials, assignments, and grades on belajar.7mit'], ['Gambaran layanan LMS dan informasi sekolah (beta).', 'Overview of the LMS and school info service (beta).'], 3, [
    co('info', 'Layanan ini berstatus beta. Fitur dapat berubah.', 'This service is in beta. Features may change.'),
    { kind: 'timeline', title: B('Isi layanan', 'What it covers'), events: [{ title: B('Materi', 'Materials'), text: B('Bahan pelajaran.', 'Lesson materials.') }, { title: B('Tugas', 'Assignments'), text: B('Mengerjakan dan mengumpulkan.', 'Do and submit.') }, { title: B('Nilai', 'Grades'), text: B('Hasil belajar.', 'Learning results.') }, { title: B('Jadwal & kehadiran', 'Schedule & attendance'), text: B('Informasi sekolah.', 'School information.') }] },
    dia('data-flow', ['Data dari server.7mit', 'Data from server.7mit'], ['Layanan membaca data akademik dari server.', 'The service reads academic data from the server.']),
  ]),
  A('konsep-https', 'server', 'mulai', ['Konsep: apa itu HTTPS', 'Concept: what is HTTPS'], ['Sambungan terenkripsi antara peramban dan server.', 'An encrypted connection between browser and server.'], 3, [
    dia('client-server', ['Perjalanan data', 'Data’s journey'], ['Dengan HTTPS, isi pesan terenkripsi.', 'With HTTPS the message content is encrypted.']),
    q1(['Apa fungsi HTTPS?', 'What does HTTPS do?'], ['Mengenkripsi data selama perjalanan.', 'Encrypts data in transit.'], [['Mengenkripsi data di perjalanan', 'Encrypts data in transit', true], ['Mempercepat internet', 'Speeds up the internet', false]]),
  ]),
  A('konsep-sesi-token', 'akun', 'mulai', ['Konsep: sesi dan token', 'Concept: sessions and tokens'], ['Cara layanan mengingat bahwa Anda sudah masuk.', 'How a service remembers you are signed in.'], 3, [
    dia('auth-flow', ['Masuk menghasilkan token', 'Signing in yields a token'], ['Token dikirim tiap permintaan.', 'The token is sent with each request.']),
    q1(['Apa yang terjadi saat Anda keluar?', 'What happens when you sign out?'], ['Token sesi dicabut.', 'The session token is revoked.'], [['Sesi dicabut', 'The session is revoked', true], ['Tidak ada', 'Nothing', false]]),
  ]),
  A('konsep-peran-izin', 'server', 'mulai', ['Konsep: peran dan izin', 'Concept: roles and permissions'], ['Mengapa dua orang melihat layar berbeda.', 'Why two people see different screens.'], 3, [
    dia('role-access', ['Peran → izin → keputusan', 'Role → permission → decision'], ['Server memutuskan.', 'The server decides.']),
    q1(['Siapa yang menegakkan izin?', 'Who enforces permissions?'], ['Server, bukan tampilan.', 'The server, not the interface.'], [['Server', 'The server', true], ['Tombol di layar', 'Buttons on screen', false]]),
  ]),
  A('konsep-api-server', 'server', 'mulai', ['Konsep: API dan fungsi server', 'Concept: APIs and server functions'], ['Cara antarmuka berbicara dengan server.', 'How an interface talks to the server.'], 3, [
    dia('client-server', ['Permintaan dan jawaban', 'Request and response'], ['Antarmuka meminta, server menjawab.', 'The interface requests, the server answers.']),
    dia('data-flow', ['Dari fungsi ke tabel', 'From function to tables'], ['Fungsi server membaca tabel data.', 'A server function reads data tables.']),
  ]),
  A('bantuan-cara-mencari', 'main', 'mulai', ['Cara mencari bantuan dengan cepat', 'How to find help quickly'], ['Pencarian, pintasan keyboard, dan filter.', 'Search, keyboard shortcut, and filters.'], 2, [
    st(['Mencari', 'Searching'], [['Tekan Ctrl/Cmd+K', 'Press Ctrl/Cmd+K', 'Kotak pencarian terbuka di mana saja.', 'The search box opens anywhere.'], ['Ketik kata kunci', 'Type keywords', 'Salah ketik kecil tetap ditemukan.', 'Small typos are still found.'], ['Gunakan filter', 'Use filters', 'Di halaman Cari: kategori, layanan, tipe.', 'On the Search page: category, service, type.']]),
    q1(['Pintasan membuka pencarian?', 'Shortcut that opens search?'], ['Ctrl atau Cmd + K.', 'Ctrl or Cmd + K.'], [['Ctrl/Cmd + K', 'Ctrl/Cmd + K', true], ['Alt + F4', 'Alt + F4', false]]),
  ]),
  A('bantuan-asisten-ai-lokal', 'main', 'ai', ['Memakai 7 MIT Help AI', 'Using 7 MIT Help AI'], ['Asisten berjalan di peramban Anda dan menjawab dari artikel.', 'The assistant runs in your browser and answers from the articles.'], 4, [
    dia('ai-generation', ['Cara kerjanya', 'How it works'], ['Pertanyaan → artikel relevan → jawaban.', 'Question → relevant articles → answer.']),
    ls(false, [['Model ±570 MB diunduh hanya setelah Anda setuju dan butuh WebGPU.', 'The ~570 MB model downloads only after you agree and needs WebGPU.'], ['Tanpa model, jawaban diambil dari pencarian artikel.', 'Without the model, answers come from article search.'], ['Pertanyaan tidak dikirim ke server.', 'Your questions are not sent to a server.']]),
    tree(['Model tidak mau aktif?', 'Model will not start?'], [['a', ['Peramban Anda mendukung WebGPU?', 'Does your browser support WebGPU?'], null, YN('b', 'n')], ['b', ['Penyimpanan dan koneksi cukup untuk 570 MB?', 'Enough storage and connection for 570 MB?'], null, YN('r', 'n2')], ['n', null, ['Gunakan mode pencarian artikel; tetap berfungsi.', 'Use article-search mode; it still works.']], ['n2', null, ['Coba di jaringan yang lebih stabil atau gunakan mode pencarian.', 'Try a steadier network or use search mode.']], ['r', null, ['Muat ulang halaman lalu aktifkan model lagi.', 'Reload the page and enable the model again.']]]),
  ], { popular: true }),
  A('bantuan-umpan-balik-kontak', 'main', 'mulai', ['Memberi masukan dan menghubungi kami', 'Giving feedback and contacting us'], ['Gunakan tombol bermanfaat di tiap artikel atau email halo@7mit.org.', 'Use the helpful buttons on each article or email halo@7mit.org.'], 2, [
    st(['Memberi masukan', 'Giving feedback'], [['Buka artikel', 'Open an article', 'Gulir ke bawah.', 'Scroll to the bottom.'], ['Tekan Ya atau Tidak', 'Press Yes or No', 'Bila Tidak, tulis apa yang kurang.', 'If No, tell us what was missing.']]),
    co('info', 'Untuk masalah akun, hubungi halo@7mit.org. Jangan menulis kata sandi pada kolom masukan.', 'For account issues email halo@7mit.org. Never write passwords in feedback.'),
  ]),
  A('pemecahan-halaman-kosong', 'oneclass', 'akun-keamanan', ['Halaman kosong atau tertahan saat memuat', 'Blank or stuck page while loading'], ['Langkah memeriksa penyebab halaman tidak muncul.', 'Steps to find why a page does not show.'], 3, [
    tree(['Diagnosis halaman kosong', 'Blank page diagnosis'], [['a', ['Layanan lain 7 MIT juga tidak terbuka?', 'Do other 7 MIT services also fail?'], null, YN('n', 'b')], ['n', null, ['Periksa koneksi internet, lalu lihat halaman status.', 'Check your internet connection, then the status page.']], ['b', ['Sudah mencoba memuat ulang keras (Ctrl/Cmd+Shift+R)?', 'Tried a hard reload (Ctrl/Cmd+Shift+R)?'], null, YN('c', 'r')], ['r', null, ['Lakukan memuat ulang keras lalu coba lagi.', 'Do a hard reload and try again.']], ['c', ['Layar berhenti di “Menyiapkan OneClass…”?', 'Is it stuck on “Preparing OneClass…”?'], null, YN('d', 'e')], ['d', null, ['Muat ulang lalu masuk lagi. Jika berulang, hubungi halo@7mit.org.', 'Reload and sign in again. If it repeats, contact halo@7mit.org.']], ['e', null, ['Coba peramban lain atau mode pribadi, lalu hubungi halo@7mit.org.', 'Try another browser or private mode, then contact halo@7mit.org.']]]),
  ]),
  A('pemecahan-tidak-aman-peramban', 'akun', 'akun-keamanan', ['Peramban menulis “Not secure”', 'Browser says “Not secure”'], ['Penyebab umum dan cara memastikan Anda memakai HTTPS.', 'Common causes and how to ensure you are on HTTPS.'], 3, [
    tree(['Mengapa “Not secure”?', 'Why “Not secure”?'], [['a', ['Alamat diawali http:// (bukan https://)?', 'Does the address start with http:// (not https://)?'], null, YN('h', 'b')], ['h', null, ['Ketik ulang alamat dengan https:// atau buka dari tautan resmi.', 'Retype the address with https:// or open it from an official link.']], ['b', ['Muncul di jaringan tertentu saja (Wi-Fi umum/sekolah)?', 'Only on a specific network (public/school Wi-Fi)?'], null, YN('w', 'x')], ['w', null, ['Jaringan itu mungkin mengubah sambungan. Coba data seluler dan jangan masukkan kata sandi di jaringan yang meragukan.', 'That network may tamper with connections. Try mobile data and do not enter passwords on a doubtful network.']], ['x', null, ['Periksa tanggal dan jam perangkat, lalu perbarui peramban. Jika masih, kirim tangkapan layar ke halo@7mit.org.', 'Check the device date/time and update the browser. If it persists, send a screenshot to halo@7mit.org.']]]),
    co('warning', 'Jangan menonaktifkan pemeriksaan sertifikat atau memilih “lanjutkan juga” untuk memasukkan kata sandi.', 'Do not bypass certificate checks or click “proceed anyway” to enter a password.'),
  ], { popular: true }),
  A('pemecahan-kuis-tidak-bisa-gabung', 'quiz', 'belajar', ['Tidak bisa bergabung ke kuis', 'Cannot join a quiz'], ['Periksa kode, koneksi, dan status kuis.', 'Check the code, connection, and quiz status.'], 2, [
    tree(['Diagnosis gabung kuis', 'Join-quiz diagnosis'], [['a', ['Kode sudah diperiksa ulang (huruf besar/kecil, tanda hubung)?', 'Did you recheck the code (case, hyphens)?'], null, YN('b', 'k')], ['k', null, ['Ketik ulang kode persis seperti dari guru.', 'Retype the code exactly as your teacher gave it.']], ['b', ['Guru sudah memulai/membuka kuis?', 'Has the teacher opened the quiz?'], null, YN('c', 'g')], ['g', null, ['Tanyakan guru; kuis mungkin belum dibuka.', 'Ask your teacher; the quiz may not be open yet.']], ['c', null, ['Periksa koneksi dan muat ulang halaman.', 'Check your connection and reload.']]]),
  ]),
];
