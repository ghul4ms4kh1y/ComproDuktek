# proses.md — Fitur Tim Proker (Many-to-Many) & Upload Dokumen Perencanaan/Hasil

Tanggal: 3 September 2026
Status: **Implementasi selesai & terverifikasi otomatis (E2E 23/23 PASS + retest PASS). Sisa: verifikasi manual via browser UI.**

---

## 1. Ringkasan Yang Sudah Dikerjakan

### A. Database & Model — SELESAI
- Migration: `backend/migrations/20260902000000-add-proker-tim-and-documents.js`
  - 2 kolom baru `program_kerjas`: `file_perencanaan`, `file_hasil` (STRING, nullable)
  - Tabel baru `program_kerja_tims` (proker_id FK CASCADE, soldier_id FK CASCADE, timestamps)
  - Unique composite index `unique_proker_soldier` pada `(proker_id, soldier_id)` — **sudah terverifikasi ada di DB** (pg_indexes)
  - Migration dibuat **idempotent** (cek kolom/tabel dulu) karena `sequelize.sync()` sempat membuat tabel join duluan
  - **Migration tambahan**: `backend/migrations/20260903010000-fix-program-kerja-tims-fks.js` — ternyata tabel join buatan `sync()` TIDAK punya FK sama sekali. Migration ini membersihkan baris yatim + menambah FK `ON DELETE CASCADE` (idempotent, cek constraint dulu). **Sudah dijalankan & terverifikasi**: FK terpasang (delete_rule=CASCADE), cascade delete proker → baris join ikut terhapus, baris yatim proker 2/3 dibersihkan, data manual user (proker 1 + 2 anggota tim) tetap utuh.
  - **Catatan penting**: `SequelizeMeta` sebelumnya tidak merekam migration lama (DB dibuat via `sequelize.sync()`). Migration lama (20260827074250, 20260901000000, 20260903000000) sudah ditandai sebagai ter-apply agar `db:migrate` berjalan bersih.
- Model baru: `backend/models/ProgramKerjaTim.js`
- `backend/models/ProgramKerja.js`: +2 field dokumen
- `backend/models/index.js`: `belongsToMany` dua arah (`as: 'tim'` / `as: 'programKerjaTim'`)

### B. Backend Middleware & Util — SELESAI
- `backend/middleware/uploadDocument.js` (BARU, upload.js tidak disentuh):
  - Folder: `backend/private-uploads/proker-documents/` (DI LUAR `/uploads` publik)
  - Filter: `.pdf/.doc/.docx` (cek extension + mimetype), 5MB
  - Nama file: `timestamp-random-namaAsliSanitasi.ext` (nama asli disisipkan agar `res.download` menampilkan nama bermakna)
- `backend/utils/fileHelper.js`: `deleteDocumentFromDisk(filename)`

### C. Controller `backend/controllers/programKerjaController.js` — SELESAI
- `index` & `show`: include `Soldier as 'tim'` (id, username, full_name), tanpa password
- `create`: parse `tim_ids` (JSON string dari FormData), simpan `req.files.file_perencanaan[0].filename`, `setTim(timIds)` setelah create
- `update`: `tim_ids` opsional (tidak dikirim = tim tidak berubah — sudah dites), file baru → hapus file lama dulu
- `remove`: hapus file dokumen dari disk saat proker dihapus (sudah dites)
- `removeFilePerencanaan` (admin, DELETE `/:id/file-perencanaan`)
- `uploadHasil` (soldier: PJ ATAU anggota tim via `item.hasTim(req.user.id)`) — **403 sekarang juga menghapus file yatim dari disk** (multer simpan sebelum cek otorisasi)
- `soldierUpdate`: fetch by id dulu, otorisasi OR (PIC match **ATAU** anggota tim), 403 jika gagal
- `downloadPerencanaan` / `downloadHasil`: admin selalu boleh; soldier hanya PIC/tim; 404 "Dokumen belum diunggah." jika kosong; `res.download` dari `private-uploads/proker-documents/`
- Helper internal `canAccessDocuments(item, req)`

### D. Routes & Server — SELESAI
- `backend/routes/programKerjaRoutes.js`:
  - POST `/` & PUT `/:id`: `requireRole('admin')` → `uploadDocument.fields([file_perencanaan])` → validation
  - DELETE `/:id/file-perencanaan` (admin)
  - PUT `/:id/hasil` (requireAuth + isSoldier + `uploadDocument.single('file_hasil')`)
  - GET `/:id/download/perencanaan` & `GET /:id/download/hasil` (requireAuth SAJA; otorisasi manual di controller)
- `backend/server.js`: **BYPASS** `upload.any()` global untuk multipart `/api/program-kerja*` — WAJIB, karena fileFilter gambar di global middleware akan menolak PDF sebelum multer dokumen di route berjalan.

### E. Frontend Admin — SELESAI
- `frontend/src/components/admin/TeamPickerField.jsx` (BARU): input pencarian + scrollable checkbox, label `Nama (Pangkat)` — fallback pangkat: `s.Pangkat?.nama || s.OrgStructure?.rank || 'Pangkat belum diisi'` (model `Pangkat` tidak ada di codebase; pangkat tersedia via `OrgStructure.rank` dari include GET /soldiers)
- `frontend/src/components/admin/ProgramKerjaFormModal.jsx` (BARU): form modal khusus halaman proker (grid 2 kolom meniru FormModal) + TeamPickerField + input file dokumen `accept=".pdf,.doc,.docx"`; **FormModal.jsx generik tidak disentuh** (halaman admin lain tetap aman)
- `frontend/src/pages/admin/ProgramKerjaManage.jsx`:
  - Fetch `GET /soldiers` → `soldierOptions`
  - Submit via **FormData** (`tim_ids` = JSON string; axios multipart otomatis)
  - Card: `Tim: X Orang` + daftar nama, section Dokumen Perencanaan (Ganti File / Hapus via ConfirmModal / Upload jika kosong), Dokumen Hasil (admin hanya tombol Download → `GET /:id/download/hasil`, nonaktif+italic jika kosong — admin TIDAK bisa upload/ganti hasil, sesuai spesifikasi)
  - ConfirmModal baru untuk hapus dokumen perencanaan

### F. Frontend Soldier — SELESAI
- `frontend/src/pages/soldier/Dashboard.jsx`:
  - State baru: `hasilFiles`, `uploadingHasilId`; import ikon `Download`
  - Helper `isPJatauTim(proker)` = `user?.org_structure_id === proker.pic_org_structure_id || proker.tim?.some(t => t.id === user?.id)`
  - Card: `Tim: X Orang` + nama anggota
  - Tombol "Tandai Selesai" memakai kondisi OR baru
  - Area khusus PIC/tim: "Download Instruksi" (`window.open /api/program-kerja/:id/download/perencanaan`) jika ada file, teks italic jika belum ada
  - "Upload Dokumen Hasil" / "Ganti File Hasil" → `PUT /:id/hasil` (FormData, field `file_hasil`), tampilkan nama file terupload
  - Soldier non-PJ/non-tim: card tetap tampil, semua tombol aksi & dokumen tersembunyi
  - Bonus fix kecil: urutan argumen `showToast` di `handleToggleSelesai` diperbaiki (`(message, type)` sesuai signature hook)

---

## 2. Hasil Verifikasi Otomatis

E2E via API (script sementara, sudah dihapus) — **23/23 PASS**:
- Login admin/soldier OK
- Create proker + 2 anggota tim + PDF perencanaan → 201, file masuk `private-uploads/proker-documents/`, TIDAK masuk `uploads/` publik
- `GET /uploads/<file-dokumen>` → **404** (tidak bisa diakses publik)
- Index include tim (2 anggota benar)
- Anggota tim: download perencanaan 200, upload hasil 200, soldier-update 200
- Outsider (bukan PJ/tim): download perencanaan/hasil → **403**, soldier-update → **403**, upload hasil → **403**
- Admin download hasil → 200
- Upload `.png` ditolak fileFilter
- Hapus perencanaan → file hilang dari disk + field null
- Update tanpa `tim_ids` → tim tetap 2 anggota (tidak ter-reset)
- Hapus proker → file hasil ikut hilang dari disk
- Retest tambahan: upload oleh outsider → 403 **dan file yatim otomatis dihapus dari disk**
- `npm run build` frontend → sukses
- DB bersih dari data test; folder `private-uploads/proker-documents/` kosong

Skema DB terverifikasi: 2 kolom ada, unique index `unique_proker_soldier` ada, FK CASCADE terpasang & cascade delete berfungsi, baris yatim dibersihkan.

Data proker hasil uji manual user (proker id=1 "wadwa" + 2 anggota tim) tetap utuh & tampil normal via API (include tim OK, file_perencanaan/file_hasil null → aman untuk proker lama).

---

## 3. Yang BELUM / Perlu Dilakukan Manual (Sisa)

1. **Verifikasi manual via browser UI** (semua uji otomatis di level API):
   - [ ] Halaman admin: buka "Kelola Program Kerja" → Buat proker baru dengan 2 anggota tim + upload PDF perencanaan → cek picker tim tampil benar (search, checkbox, label Nama (Pangkat))
   - [ ] Halaman admin: tombol "Ganti File" / "Hapus" dokumen perencanaan berfungsi; setelah hapus tombol "+ Upload File" muncul lagi
   - [ ] Halaman admin: dokumen hasil hanya tombol download (tidak ada tombol ganti/hapus)
   - [ ] Login soldier anggota tim → tombol "Download Instruksi", "Upload Dokumen Hasil", "Tandai Selesai" MUNCUL & berfungsi
   - [ ] Login soldier lain → proker terlihat tapi semua tombol aksi & dokumen TIDAK muncul
   - [ ] Cek tampilan responsif card setelah tambahan section dokumen & tim
2. **Proker lama** (tim kosong, file null) tampil normal di kedua dashboard — di level API sudah aman (include tim = []), belum dicek via UI.
3. **Server dev mati saat sesi ini berakhir** — jalankan `npm run dev` di backend sebelum uji UI.
4. **Catatan produksi**: `sequelize.sync()` di `server.js` tidak menambah kolom ke tabel lama — pastikan migration dijalankan di environment production (`npx sequelize-cli db:migrate`), jangan andalkan sync.
5. **Catatan kecil**:
   - Label pangkat memakai `OrgStructure.rank` (model `Pangkat` tidak ada di codebase). Jika nanti ada model Pangkat, tambahkan fallback di `TeamPickerField.jsx`.
   - Bypass di `server.js` hanya berlaku untuk request multipart ke path `/api/program-kerja*`; endpoint proker lain (JSON) tidak terpengaruh.
   - Dokumen di-download via `window.open` (cookie httpOnly terkirim otomatis, same-origin via proxy Vite).

---

## 4. Berkas Yang Diubah/Dibuat

**Baru:**
- `backend/migrations/20260902000000-add-proker-tim-and-documents.js`
- `backend/migrations/20260903010000-fix-program-kerja-tims-fks.js`
- `backend/models/ProgramKerjaTim.js`
- `backend/middleware/uploadDocument.js`
- `backend/utils/fileHelper.js`
- `frontend/src/components/admin/TeamPickerField.jsx`
- `frontend/src/components/admin/ProgramKerjaFormModal.jsx`
- `backend/private-uploads/proker-documents/` (folder, dibuat otomatis middleware)

**Diubah:**
- `backend/models/ProgramKerja.js` (+2 field)
- `backend/models/index.js` (relasi many-to-many)
- `backend/controllers/programKerjaController.js` (index/show/create/update/remove/soldierUpdate + 4 method baru + helper)
- `backend/routes/programKerjaRoutes.js` (multer + 4 route baru)
- `backend/server.js` (bypass global multer untuk multipart proker)
- `frontend/src/pages/admin/ProgramKerjaManage.jsx` (FormData, soldier picker, section dokumen & tim)
- `frontend/src/pages/soldier/Dashboard.jsx` (tim, kondisi OR, upload hasil, download instruksi)

**Tidak disentuh (sesuai batasan):** `computeProkerStatus.js`, `middleware/upload.js`, `FormModal.jsx`, validasi `alasan_keterlambatan`.
