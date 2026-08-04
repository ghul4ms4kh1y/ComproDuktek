# Website Company Profile & Dashboard Admin — Satlak Dukteksi Pussiberad TNI AD

Proyek ini terdiri dari dua bagian:
- **backend/** — REST API (Express.js + Sequelize + MySQL)
- **frontend/** — React.js (Public Site 9 halaman + Dashboard Admin)

Sesuai PRD: palet warna Navy (#0B2545), Biru Baja (#13315C), Emas (#C9A227); autentikasi JWT via cookie httpOnly; URL admin khusus `/admin-portal` (tidak ditautkan di navigasi publik, di-noindex).

---

## 1. Prasyarat

- Node.js versi 18 atau lebih baru
- MySQL 8 (atau MariaDB) yang sudah berjalan
- npm

## 2. Setup Database

Buat database kosong terlebih dahulu:

```sql
CREATE DATABASE dukteksi_db CHARACTER SET utf8mb4;
```

Tabel akan dibuat otomatis oleh Sequelize (`sequelize.sync()`) saat backend pertama kali dijalankan — tidak perlu import file SQL manual. Skema mengikuti Bagian 5 & 7.3 pada PRD (admins, news, products, galleries, faqs, messages).

## 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit file `.env` — sesuaikan minimal:
- `DB_USER`, `DB_PASSWORD` — kredensial MySQL Anda
- `JWT_SECRET` — ganti dengan string acak yang panjang & rahasia
- `SEED_ADMIN_PASSWORD` — password admin awal, **wajib diganti**

Buat akun admin pertama:

```bash
npm run seed
```

Jalankan server (development, auto-reload):

```bash
npm run dev
```

Backend berjalan di `http://localhost:5000`. Cek `http://localhost:5000/api/health` untuk memastikan server aktif.

## 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173` dan otomatis meneruskan (proxy) request `/api` dan `/uploads` ke backend port 5000 — jadi tidak perlu setting CORS tambahan saat development.

- Situs publik: `http://localhost:5173/`
- Dashboard admin: `http://localhost:5173/admin-portal/login`
  - Login dengan username/password dari `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` di `.env`

## 5. Struktur Folder

```
dukteksi/
├── backend/
│   ├── config/database.js       # koneksi Sequelize
│   ├── models/                  # Admin, News, Product, Gallery, Faq, Message
│   ├── controllers/             # logika bisnis (crudFactory = CRUD generik)
│   ├── routes/                  # endpoint REST API
│   ├── middleware/               # auth (JWT) & upload (multer)
│   ├── uploads/                  # file gambar tersimpan di sini
│   ├── seed.js                   # skrip pembuat admin awal
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/public/         # 9 halaman publik
    │   ├── pages/admin/          # Login, Dashboard, CRUD, Kotak Masuk
    │   ├── components/public/    # Navbar, Footer, FaqAccordion, dll
    │   ├── components/admin/     # Sidebar, CrudManager, FormModal, dll
    │   ├── layouts/               # PublicLayout, AdminLayout
    │   ├── context/AuthContext.jsx
    │   └── services/api.js
    └── tailwind.config.js         # palet warna resmi
```

## 6. Build untuk Produksi

```bash
# Frontend
cd frontend
npm run build      # hasil di frontend/dist

# Backend
cd backend
# set NODE_ENV=production, COOKIE_SECURE=true (wajib HTTPS) di .env
npm start
```

Untuk produksi, sajikan `frontend/dist` melalui web server (Nginx/Apache) atau `express.static`, dan arahkan `/api` ke backend Express. Sesuaikan hosting dengan kebijakan infrastruktur internal TNI AD (Bagian 7.1 PRD).

## 7. Catatan Keamanan (sesuai PRD Bagian 6 & 9.3)

- Password admin di-hash dengan bcrypt — tidak pernah disimpan sebagai plain text.
- Autentikasi via JWT dalam cookie `httpOnly` (mitigasi XSS terhadap token).
- `robots.txt` sudah memblokir indexing `/admin-portal`.
- Validasi input diterapkan di sisi client (React) dan server (express-validator + Sequelize).
- **Wajib** dilakukan sebelum go-live: aktifkan HTTPS, ganti `JWT_SECRET` & password admin default, audit tambahan proteksi SQLi/XSS/CSRF sesuai kebijakan keamanan internal satuan.

## 8. Fitur yang Belum Termasuk (Out-of-Scope sesuai PRD)

- Integrasi sistem internal TNI AD lain (SIMAK, e-office, dll.)
- Aplikasi mobile native
- Multi-bahasa
- Multi-role/hak akses berjenjang (hanya 1 peran: Admin)
- Payment gateway/modul transaksi

## 9. Langkah Lanjutan yang Disarankan

1. Isi konten statis (Tentang Kami, Sejarah, Visi Misi, Struktur Organisasi, info kontak) — saat ini masih placeholder teks di komponen React, sesuai catatan PRD bahwa halaman ini bisa dikelola sebagai CMS page pada fase lanjutan.
2. Tambahkan data awal (berita, produk, galeri, FAQ) melalui Dashboard Admin setelah login.
3. Uji UAT sesuai kriteria penerimaan di Bagian 9 PRD.
4. Siapkan lingkungan hosting/deploy sesuai kebijakan TNI AD.
