# Compro Dukteksi Pussiberad

Website company profile dan dashboard internal Satlak Dukteksi Pussiberad TNI AD.

Aplikasi ini terdiri dari:

- **Frontend**: React 18, Vite, dan Tailwind CSS.
- **Backend**: Node.js, Express, Sequelize, dan PostgreSQL.
- **Penyimpanan**: PostgreSQL untuk data, volume Docker untuk gambar publik dan dokumen privat.

## Persyaratan

Untuk menjalankan tanpa Docker:

- Node.js 20 atau lebih baru.
- PostgreSQL 14 atau lebih baru.
- npm.

Untuk menjalankan dengan Docker:

- Docker Engine.
- Docker Compose Plugin, sehingga perintah yang dipakai adalah `docker compose`.

## Menjalankan secara lokal tanpa Docker

### 1. Clone dan masuk ke folder proyek

```bash
git clone <URL_REPOSITORY>
cd ComproDuktek
```

### 2. Siapkan database PostgreSQL

Buat database kosong:

```sql
CREATE DATABASE dukteksi_db;
```

Jika PostgreSQL memakai user atau password berbeda, gunakan nilainya pada file environment backend.

### 3. Siapkan environment backend

```bash
cd backend
cp .env.example .env
```

Pada Windows PowerShell, gunakan:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env`, terutama:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `SEED_ADMIN_PASSWORD`

Jangan commit file `.env`.

### 4. Install dependency dan siapkan backend

```bash
npm ci
npm start
```

Backend berjalan pada `http://localhost:5000`.

Perintah `npm start` membuat tabel melalui Sequelize pada database yang dikonfigurasi.

Buka terminal kedua untuk membuat data awal:

```bash
cd backend
npm run seed
npm run seed:org
```

`npm run seed` membuat atau memperbarui akun admin dari variabel `SEED_ADMIN_*`. `npm run seed:org` mengisi struktur organisasi awal.

Jika akun prajurit diperlukan, jalankan setelah struktur organisasi tersedia:

```bash
npm run seed:soldiers
```

### 5. Jalankan frontend

```bash
cd frontend
npm ci
npm run dev
```

Buka `http://localhost:5173`.

Frontend menggunakan proxy Vite untuk meneruskan `/api` dan `/uploads` ke backend pada port 5000.

Untuk membuat build production:

```bash
cd frontend
npm run build
npm run preview
```

## Menjalankan dengan Docker Compose

Docker Compose menjalankan tiga service:

- `db`: PostgreSQL.
- `backend`: API Express.
- `frontend`: build React yang disajikan Nginx dan meneruskan request API ke backend.

### 1. Siapkan environment Docker

Dari root proyek:

```bash
cp .env.docker.example .env
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.docker.example .env
```

Sebelum menjalankan, ubah minimal:

- `DB_PASSWORD`
- `JWT_SECRET`
- `SEED_ADMIN_PASSWORD`

`JWT_SECRET` sebaiknya berupa nilai acak panjang. Contoh dengan Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Build dan jalankan stack

```bash
docker compose up -d --build
```

Lihat status container:

```bash
docker compose ps
```

Lihat log:

```bash
docker compose logs -f backend
```

Buka aplikasi pada:

- `http://localhost`, jika `PORT_HTTP=80`.
- `http://localhost:<PORT_HTTP>`, jika port HTTP diubah.

Health check API:

```text
http://localhost/api/health
```

### 3. Buat data awal

Setelah container backend berjalan, buat admin dan struktur organisasi:

```bash
docker compose exec backend npm run seed
docker compose exec backend npm run seed:org
```

Untuk membuat akun prajurit dari struktur organisasi:

```bash
docker compose exec backend npm run seed:soldiers
```

Gunakan username dan password yang berasal dari `SEED_ADMIN_USERNAME` dan `SEED_ADMIN_PASSWORD` pada file `.env`.

### 4. Operasional Docker

Menghentikan container tanpa menghapus data:

```bash
docker compose stop
```

Menjalankan kembali:

```bash
docker compose start
```

Menghentikan dan menghapus container serta network:

```bash
docker compose down
```

Menghapus container sekaligus seluruh volume database dan upload. **Perintah ini menghapus data secara permanen.**

```bash
docker compose down -v
```

Memperbarui aplikasi setelah pull kode baru:

```bash
git pull
docker compose up -d --build
```

## Data persisten Docker

Compose membuat volume berikut:

- `postgres_data`: data PostgreSQL.
- `uploads_data`: gambar publik yang diunggah melalui dashboard.
- `private_uploads_data`: dokumen program kerja yang hanya diakses melalui endpoint berotorisasi.

Jangan menghapus volume ketika hanya ingin memperbarui image aplikasi.

Untuk melihat volume:

```bash
docker volume ls
```

## Konfigurasi local server

Jika aplikasi diakses dari komputer lain pada jaringan lokal:

1. Tetapkan `PORT_HTTP` ke port yang tersedia pada server.
2. Ubah `FRONTEND_URL` menjadi alamat yang benar, misalnya `http://192.168.1.20:8080`.
3. Jalankan `docker compose up -d --build`.
4. Buka port tersebut pada firewall server jika diperlukan.
5. Akses aplikasi melalui `http://<IP-SERVER>:<PORT_HTTP>`.

Untuk penggunaan HTTPS, letakkan reverse proxy seperti Nginx atau Caddy di depan service frontend. Setelah HTTPS aktif, tinjau kembali `COOKIE_SECURE` dan set ke `true`.

## Troubleshooting

### Backend tidak dapat terhubung ke database

Pastikan container database sehat:

```bash
docker compose ps
docker compose logs db
```

Di dalam Compose, `DB_HOST` harus bernilai `db`, bukan `localhost`.

### Port 80 sudah digunakan

Ubah pada `.env`:

```env
PORT_HTTP=8080
```

Lalu jalankan ulang:

```bash
docker compose up -d
```

Aplikasi tersedia pada `http://localhost:8080`.

### Login gagal setelah mengganti konfigurasi admin

Jalankan kembali:

```bash
docker compose exec backend npm run seed
```

Perintah ini memperbarui password dan data admin sesuai `SEED_ADMIN_*`.

### Melihat error aplikasi

```bash
docker compose logs -f backend frontend
```

## Validasi perubahan

Build frontend:

```bash
cd frontend
npm run build
```

Uji health check ketika Docker aktif:

```bash
curl http://localhost/api/health
```

Response yang diharapkan:

```json
{"status":"ok"}
```

## Catatan keamanan

- Jangan memakai nilai default pada `.env` untuk server yang dapat diakses publik.
- Jangan commit `backend/.env`, `.env`, password, JWT secret, atau file hasil upload.
- Gunakan HTTPS untuk deployment di luar jaringan lokal.
- Simpan backup PostgreSQL dan volume upload secara terpisah dari host aplikasi.
