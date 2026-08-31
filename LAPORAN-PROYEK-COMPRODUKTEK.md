# LAPORAN PROYEK AKHIR
## ComproDuktek: Website Company Profile & Portal Administrasi Internal
### Satlak Dukteksi Pussiberad TNI AD

---

## IDENTITAS PROYEK

| Keterangan | Isi |
|---|---|
| **Nama Proyek** | ComproDuktek (Company Profile + Dukteksi) |
| **Satuan Pengguna** | Satlak Dukteksi Pussiberad TNI AD |
| **Tujuan** | Website company profile publik + portal administrasi internal untuk satuan |
| **Periode Pengembangan** | [Isi sesuai tanggal PKL Anda] |
| **Pembimbing PKL** | [Nama pembimbing] |
| **Penyusun** | [Nama Anda] |

---

## 1. PENDAHULUAN

### Latar Belakang

Satlak Dukteksi Pussiberad, sebagai satuan operasional TNI AD, memerlukan identitas digital yang profesional untuk:

1. **Representasi publik** — menampilkan profil satuan, sejarah, visi-misi, struktur organisasi, produk unggulan, dan berita kegiatan kepada publik dan stakeholder internal TNI AD.
2. **Administrasi internal** — mengelola data operasional seperti jadwal piket prajurit, program kerja satuan, rekap presensi, laporan harian, dan komunikasi internal dengan lebih efisien dan terorganisir.

Sebelumnya, dokumentasi dan administrasi dilakukan secara manual melalui berbagai file terpisah, sehingga mempersulit akses dan manajemen data. Dengan ComproDuktek, semua kebutuhan tersebut terpusat dalam satu platform web yang mudah diakses dan dikelola.

### Tujuan Pembuatan Proyek

- Menyediakan website company profile yang profesional, menampilkan identitas dan keunggulan satuan.
- Menyediakan portal administrasi internal yang mengintegrasikan manajemen presensi, jadwal, program kerja, dan laporan harian.
- Meningkatkan efisiensi komunikasi dan dokumentasi di lingkungan satuan.
- Memberikan pengalaman pengguna yang intuitif untuk prajurit dan admin satuan.

### Scope Pengembangan

Proyek ini mencakup dua lingkungan utama:
- **Lingkungan Publik** — website resmi yang dapat diakses siapa saja.
- **Lingkungan Administrasi Internal** — portal terbatas untuk admin satuan dan prajurit dengan kredensial login.

---

## 2. DESKRIPSI PROYEK

### 2.1 Ikhtisar Umum

ComproDuktek adalah aplikasi web modern yang menggabungkan **website company profile publik** dengan **portal administrasi internal**. Sistem ini dibangun untuk memenuhi kebutuhan Satlak Dukteksi Pussiberad TNI AD dalam meningkatkan profesionalisme layanan dan efisiensi administrasi.

Semboyan satuan, **"Krtrima Raksa Mandalam"** (Keyakinan, Keterampilan, Kemandirian, Keberanian, Ketahanan dalam Pengamanan Informasi), menjadi filosofi yang mendasari nilai-nilai sistem ini: transparan, aman, dan mandiri.

### 2.2 Situs Publik (9 Halaman)

Pengunjung dapat mengakses informasi satuan tanpa perlu login:

| Halaman | Fungsi |
|---|---|
| **Beranda** | Slider hero, tagline satuan, pilar-pilar kemampuan, produk unggulan, dan berita terkini |
| **Tentang Kami** | Profil satuan, penjelasan semboyan, tugas pokok & fungsi, makna elemen logo |
| **Struktur Organisasi** | Bagan interaktif struktur organisasi dengan foto, jabatan, tipe kepribadian (DISC) anggota |
| **Produk** | Katalog produk unggulan satuan dengan filter status (Aktif, Dalam Pengembangan, Nonaktif) |
| **Detail Produk** | Halaman detail per produk: deskripsi, fitur, kategori, unit pengampu |
| **Galeri** | Koleksi foto kegiatan satuan dengan tampilan gallery bento grid |
| **Berita** | Daftar berita kegiatan dengan kategori dinamis dan fitur pencarian |
| **Detail Berita** | Artikel lengkap dengan tanggal, waktu baca, dan berita terkait |
| **Kontak** | Formulir pesan publik + informasi kontak satuan (alamat, telepon, email) |

### 2.3 Portal Admin (`/admin-portal`)

Admin satuan dapat mengelola semua konten dan data operasional melalui dashboard terpusat dengan 11 modul:

#### Dashboard
- Ringkasan statistik: total berita, produk, galeri, dan pesan masuk belum dibaca.
- Visualisasi distribusi anggota per jenis kepribadian (DISC).
- Kalender jadwal piket bulan berjalan.

#### Manajemen Konten
- **Berita** — tambah, edit, hapus, upload thumbnail, publikasi berita kegiatan satuan.
- **Produk** — kelola produk unggulan dengan deskripsi, kategori, status, dan foto produk.
- **Galeri** — kelola koleksi foto dengan tanggal dan deskripsi.

#### Manajemen Internal
- **Struktur Organisasi** — kelola bagan organisasi (tambah/edit/hapus posisi), atribut DISC, dan reset posisi kosong.
- **Anggota (Prajurit)** — kelola profil prajurit, foto, jabatan, reset password.
- **Jadwal Piket** — buat jadwal piket otomatis per bulan (sistem round-robin), verifikasi dan approve usulan perubahan piket dari prajurit, lihat kalender visual.
- **Program Kerja** — kelola program kerja satuan dengan tanggal mulai-selesai, PIC, dan tracking status (on-track/tertunda/selesai).
- **Rekap Presensi** — verifikasi dan aprove sanggahan kehadiran prajurit yang melapor kehadiran tidak sesuai data sistem.
- **Laporan Harian** — lihat laporan harian prajurit dengan detail sesi aktivitas per hari.

#### Komunikasi
- **Kotak Masuk** — terima, baca, dan kelola pesan dari publik melalui form Kontak di situs publik.

### 2.4 Portal Prajurit (`/soldier/dashboard`)

Setiap prajurit dapat mengakses data pribadi dan tugas operasional:

- **Jadwal Piket Pribadi** — melihat jadwal piketnya, dengan opsi mengajukan usulan perubahan disertai alasan (sakit, izin, keperluan lain).
- **Rekap Presensi** — melihat kehadiran pribadi per tanggal, status kehadiran (hadir, sakit, izin, tugas, dinas luar, dll.), dan opsi mengajukan sanggahan dengan keterangan jika data tidak sesuai.
- **Laporan Harian** — membuat laporan aktivitas harian multi-sesi (misalnya: Sesi 1 pukul 08.00-10.00, Sesi 2 pukul 10.00-12.00, dst.) dengan deskripsi aktivitas dan output hasil per sesi. Admin dapat melihat laporan ini untuk monitoring.
- **Program Kerja Saya** — melihat program kerja yang menjadi PIC (Penanggung Jawab) dan update status pelaksanaannya.
- **Profil Saya** — edit foto profil, ganti password, lihat data pribadi (nama, jabatan, kepribadian DISC).

---

## 3. TEKNOLOGI YANG DIGUNAKAN

### 3.1 Backend (Server)

| Teknologi | Peran |
|---|---|
| **Node.js + Express.js** | Framework server web dan REST API |
| **PostgreSQL** | Database untuk menyimpan data berita, produk, galeri, user, jadwal, presensi, laporan |
| **Sequelize ORM** | Library untuk interaksi dengan database secara terstruktur |
| **Multer** | Middleware untuk upload file (foto, thumbnail, profil prajurit) |
| **JWT (JSON Web Token)** | Sistem autentikasi token berbasis cookie httpOnly |
| **bcrypt** | Enkripsi password untuk keamanan login |

Endpoint REST API dikembangkan untuk setiap fitur (CRUD = Create, Read, Update, Delete) dengan sistem otorisasi yang membedakan hak akses admin dan prajurit.

### 3.2 Frontend (Tampilan)

| Teknologi | Peran |
|---|---|
| **React.js** | Library JavaScript untuk membangun UI interaktif |
| **Vite** | Build tool modern untuk development dan production |
| **Tailwind CSS** | Framework styling dengan utility-first approach |
| **Framer Motion** | Library animasi untuk transisi halus dan efek visual |
| **Axios** | HTTP client untuk komunikasi dengan backend API |
| **React Router** | Navigasi multi-halaman dalam SPA (Single Page Application) |

Palet warna resmi:
- **Navy** (#0B2545) — warna utama
- **Biru Baja** (#13315C) — aksen, hover state
- **Emas** (#C9A227) — highlight, badge, notifikasi

### 3.3 Infrastruktur & Deployment

- **Storage File Lokal** — foto dan file upload disimpan di folder `/uploads` server backend.
- **Development Environment** — Vite dengan proxy untuk mensimulasikan same-origin antara frontend dan backend.
- **Production** — Backend berjalan sebagai Node.js process; frontend di-build menjadi static files yang disajikan melalui web server (Nginx/Apache) atau Express static middleware.

---

## 4. FITUR UNGGULAN & KEAMANAN DASAR

### 4.1 Fitur Unggulan

1. **Login Aman Berbasis Role** — sistem login dengan verifikasi username/email dan password, memproduksi token JWT yang tersimpan dalam cookie httpOnly (tidak bisa diakses JavaScript, mitigasi XSS). Setiap token berlaku 8 jam.

2. **Dual Portal** — satu aplikasi melayani dua tipe pengguna dengan hak akses berbeda:
   - **Admin**: mengelola semua konten, merekap presensi, approve usulan.
   - **Prajurit**: melihat jadwal piket, laporan presensi, membuat laporan harian, mengajukan sanggahan/usulan.

3. **Upload File Aman** — foto dan file hanya boleh format gambar (JPEG, PNG, WebP), maksimal 5 MB, nama file di-sanitasi otomatis untuk menghindari konflik nama dan kerentanan.

4. **Pagination & Pencarian** — untuk modul dengan data banyak (berita, produk, galeri), sistem pagination server-side memastikan kinerja tetap optimal.

5. **Dark Mode** — tema gelap terintegrasi, preferensi tersimpan di browser pengguna.

6. **Bagan Organisasi Interaktif** — struktur organisasi dapat dilihat secara visual sebagai pohon (desktop) atau list (mobile), dilengkapi detail anggota termasuk tipe kepribadian DISC.

7. **Otomasi Jadwal Piket** — sistem dapat membuat jadwal piket otomatis untuk satu bulan dengan distribusi merata (round-robin) antar prajurit, mulai dari prajurit terakhir bulan sebelumnya untuk continuity.

### 4.2 Keamanan Dasar

- **Password Encryption** — semua password di-hash dengan bcrypt sebelum disimpan.
- **Session Management** — token JWT dengan expiry 8 jam untuk mencegah session hijacking jangka panjang.
- **Authorization** — setiap endpoint API dilindungi middleware yang memverifikasi role pengguna (admin/prajurit).
- **Input Validation** — semua input dari user divalidasi di sisi server untuk mencegah injeksi data berbahaya.
- **CSRF Protection** — cookie policy menggunakan `sameSite: lax` untuk mitigasi cross-site request forgery.
- **Anti Mass-Assignment** — field sensitif seperti `admin_id`, `created_at`, `updated_at` tidak bisa diubah dari form user.
- **File Upload Security** — whitelist mime-type, batas ukuran file, nama file di-sanitasi.
- **Admin Portal Hidden** — URL admin `/admin-portal` tidak ditautkan di navigasi publik, serta di-noindex dari mesin pencari untuk menambah lapisan keamanan melalui obscurity.

---

## 5. ALUR PENGGUNAAN & HASIL

### 5.1 Alur Pengunjung Publik

```
Pengunjung membuka situs (http://localhost:5173 atau domain production)
    ↓
Melihat halaman beranda dengan hero slider, berita, produk
    ↓
Browsing: struktur organisasi, produk, galeri, berita
    ↓
Opsional: kirim pesan kontak → data masuk ke Kotak Masuk admin
```

### 5.2 Alur Admin Satuan

```
Admin login (username/password) → token JWT cookie httpOnly
    ↓
Masuk Dashboard Admin
    ↓
Kelola konten (berita, produk, galeri, struktur organisasi, anggota)
    ↓
Kelola operasional (jadwal piket, program kerja, presensi, laporan harian)
    ↓
Verifikasi & approval (sanggahan presensi, usulan piket)
    ↓
Monitor Kotak Masuk pesan publik
```

### 5.3 Alur Prajurit

```
Prajurit login (username/password) → token JWT cookie httpOnly
    ↓
Masuk Dashboard Prajurit
    ↓
Lihat jadwal piket pribadi → opsional: ajukan usulan perubahan
    ↓
Lihat rekap presensi → opsional: ajukan sanggahan kehadiran
    ↓
Buat/edit laporan harian multi-sesi
    ↓
Update status program kerja yang menjadi PIC
    ↓
Edit profil pribadi
```

### 5.4 Hasil Implementasi

Sesuai dengan PRD (Product Requirements Document) yang telah disepakati:

- ✅ Website publik dengan 9 halaman sesuai spesifikasi
- ✅ Portal admin dengan 11 modul manajemen konten & operasional
- ✅ Portal prajurit untuk self-service data presensi, jadwal, laporan
- ✅ Sistem autentikasi berbasis JWT dengan role-based access control
- ✅ Upload file aman dengan validasi dan limit ukuran
- ✅ Desain responsif (desktop & mobile) dengan Tailwind CSS
- ✅ Dark mode terintegrasi
- ✅ Bagan organisasi interaktif dengan DISC personality type
- ✅ Otomasi jadwal piket bulanan

---

## 6. KENDALA DAN SOLUSI

### Kendala yang Dihadapi

| Kendala | Solusi |
|---|---|
| **Database PostgreSQL vs Dokumentasi MySQL** | README awalnya menyebutkan MySQL, tetapi implementasi aktual menggunakan PostgreSQL. Dokumentasi telah disamakan dengan implementasi. |
| **Konten Statis vs Dinamis** | Beberapa halaman seperti "Tentang Kami" dan "Kontak" masih berisi konten statis yang di-hardcode. Untuk fase pengembangan lanjutan, bisa diubah menjadi managed content (CMS). |
| **Pagination Campuran** | Frontend menggunakan pagination client-side untuk beberapa modul (berita, galeri) dan server-side untuk modul admin CRUD. Untuk optimasi lebih lanjut, bisa distandarkan ke server-side. |
| **Sequelize Sync di Production** | File `server.js` menggunakan `sequelize.sync()` yang otomatis membuat tabel. Di production environment, disarankan menggunakan migration system yang lebih controlled. |

### Rekomendasi Pengembangan Lanjutan

1. Integrasi sistem internal TNI AD lain (SIMAK, e-office, dll.) melalui API bridge.
2. Implementasi audit trail untuk semua perubahan data admin (siapa, kapan, apa yang diubah).
3. Modul reporting & analytics untuk statistik presensi, program kerja, kegiatan satuan.
4. Push notification untuk notifikasi real-time prajurit (jadwal piket, sanggahan diapprove, dll.).
5. Mobile app native (iOS/Android) untuk portal prajurit.
6. Multi-bahasa support (Bahasa Indonesia, Inggris).
7. Managed hosting & CDN untuk performa dan keandalan production.

---

## 7. LAMPIRAN: TANGKAPAN LAYAR (SCREENSHOT)

Berikut daftar screenshot yang disarankan untuk melengkapi laporan. Silakan ambil screenshot dari aplikasi yang sedang berjalan dan tempelkan di bagian ini:

### 7.1 Situs Publik

- **[Screenshot 1]** Halaman Beranda — hero slider, tagline satuan, pilar kemampuan
- **[Screenshot 2]** Halaman Struktur Organisasi — bagan pohon desktop atau list mobile
- **[Screenshot 3]** Halaman Produk — katalog dengan filter kategori & status
- **[Screenshot 4]** Halaman Galeri — gallery grid dengan efek hover
- **[Screenshot 5]** Halaman Berita — list berita dengan fitur pencarian
- **[Screenshot 6]** Halaman Kontak — formulir pesan & informasi satuan

### 7.2 Portal Admin

- **[Screenshot 7]** Halaman Login Admin — form login username/email + password
- **[Screenshot 8]** Dashboard Admin — statistik, donut chart DISC, mini calendar
- **[Screenshot 9]** Modul Berita — tabel daftar berita dengan tombol edit/hapus/tambah
- **[Screenshot 10]** Form Tambah Berita — input judul, konten, kategori, upload thumbnail
- **[Screenshot 11]** Modul Struktur Organisasi — pohon organisasi dengan tombol edit per node
- **[Screenshot 12]** Modul Jadwal Piket — kalender & tabel jadwal, tombol generate bulanan
- **[Screenshot 13]** Modul Rekap Presensi — tabel presensi dengan opsi review sanggahan
- **[Screenshot 14]** Kotak Masuk — daftar pesan publik dengan badge unread

### 7.3 Portal Prajurit

- **[Screenshot 15]** Halaman Login Prajurit — form login (username/email + password)
- **[Screenshot 16]** Dashboard Prajurit — jadwal piket, presensi, mini calendar
- **[Screenshot 17]** Bagian Jadwal Piket — kalender visual & opsi usulan perubahan
- **[Screenshot 18]** Bagian Presensi — tabel kehadiran dengan opsi ajukan sanggahan
- **[Screenshot 19]** Form Laporan Harian — input aktivitas multi-sesi (nama sesi, aktivitas, output)
- **[Screenshot 20]** Bagian Profil — edit foto, ganti password

---

## KESIMPULAN

ComproDuktek adalah solusi terintegrasi yang menggabungkan kebutuhan representasi publik Satlak Dukteksi Pussiberad TNI AD dengan administrasi internal yang efisien. Dengan fitur-fitur modern, keamanan berlapis, dan user experience yang intuitif, sistem ini diharapkan dapat meningkatkan profesionalisme layanan dan produktivitas satuan.

Pengembangan proyek ini telah mengikuti best practices dalam web development modern, dengan fokus pada keandalan, keamanan, dan kemudahan penggunaan untuk semua tipe pengguna (publik, admin, prajurit).

---

**Tanggal Laporan:** [Isi dengan tanggal submission Anda]  
**Disusun oleh:** [Nama Anda]  
**Pembimbing PKL:** [Nama pembimbing]  
**Satuan:** Satlak Dukteksi Pussiberad TNI AD
