/**
 * Seed data DUMMY untuk struktur organisasi (tabel org_structures).
 * Membuat hierarki bertingkat mirip contoh gambar:
 *   - 1 pucuk pimpinan (level 1, merah)
 *   - 3 cabang di bawahnya (level 2, oranye) — 2 di antaranya punya rantai
 *     bawahan tunggal sampai level 4
 *   - dari ujung salah satu rantai itu, muncul 3 "hub" satuan pelaksana
 *     (level 5, oranye), masing-masing punya 2 sub-unit (level 6) dan
 *     beberapa staf (level 7), salah satunya ada 1 staf tambahan (level 8)
 *
 * CARA PAKAI:
 *   1. Taruh file ini di folder backend/ (sejajar dengan seed.js)
 *   2. Pastikan kolom `level` sudah ada di tabel org_structures (lihat
 *      instruksi migrasi di chat / README)
 *   3. Tambahkan script di backend/package.json:
 *        "seed:org": "node seedOrgDummy.js"
 *   4. Jalankan:
 *        npm run seed:org            -> menambahkan data dummy (append)
 *        npm run seed:org -- --reset -> menghapus SEMUA data org_structures
 *                                       dulu, baru mengisi ulang dari nol
 */

require('dotenv').config();
const { sequelize, OrgStructure, Admin } = require('./models');

const RESET = process.argv.includes('--reset');

// Definisi node: { key, name, position, rank, level, color, parentKey }
// key & parentKey hanya dipakai di script ini untuk menyusun relasi,
// TIDAK disimpan ke database.
const NODES = [
  // ---- Level 1: pucuk pimpinan ----
  { key: 'root', name: 'Kolonel Cba Ahmad Wijaya', position: 'Komandan Satlak Dukteksi', rank: 'Kolonel Cba', level: 1, color: 'merah', parentKey: null },

  // ---- Level 2: 3 cabang langsung di bawah pimpinan ----
  { key: 'a', name: 'Letkol Cba Budi Santoso', position: 'Wakil Komandan', rank: 'Letkol Cba', level: 2, color: 'oranye', parentKey: 'root' },
  { key: 'b', name: 'Letkol Cba Dedi Kurniawan', position: 'Kepala Bagian Operasi', rank: 'Letkol Cba', level: 2, color: 'oranye', parentKey: 'root' },
  { key: 'c', name: 'Letkol Cba Eko Prasetyo', position: 'Kepala Bagian Umum', rank: 'Letkol Cba', level: 2, color: 'oranye', parentKey: 'root' },

  // ---- Level 3: rantai bawahan tunggal dari cabang A dan B ----
  { key: 'a1', name: 'Mayor Cba Fajar Ramadhan', position: 'Kasubbag Perencanaan', rank: 'Mayor Cba', level: 3, color: 'teal', parentKey: 'a' },
  { key: 'b1', name: 'Mayor Cba Gita Permana', position: 'Kasubbag Operasi', rank: 'Mayor Cba', level: 3, color: 'teal', parentKey: 'b' },

  // ---- Level 4: lanjutan rantai A dan B ----
  { key: 'a2', name: 'Kapten Cba Hendra Saputra', position: 'Kaur Perencanaan', rank: 'Kapten Cba', level: 4, color: 'teal', parentKey: 'a1' },
  { key: 'b2', name: 'Kapten Cba Indra Gunawan', position: 'Kaur Operasi', rank: 'Kapten Cba', level: 4, color: 'teal', parentKey: 'b1' },

  // ---- Level 5: 3 hub Satuan Pelaksana, semua anak dari b2 ----
  { key: 'hub1', name: 'Kapten Cba Joko Widodo', position: 'Kepala Satuan Pelaksana 1', rank: 'Kapten Cba', level: 5, color: 'oranye', parentKey: 'b2' },
  { key: 'hub2', name: 'Kapten Cba Krisna Mahendra', position: 'Kepala Satuan Pelaksana 2', rank: 'Kapten Cba', level: 5, color: 'oranye', parentKey: 'b2' },
  { key: 'hub3', name: 'Kapten Cba Lukman Hakim', position: 'Kepala Satuan Pelaksana 3', rank: 'Kapten Cba', level: 5, color: 'oranye', parentKey: 'b2' },

  // ---- Level 6: 2 sub-unit di tiap hub ----
  { key: 'h1a', name: 'Lettu Cba Made Wirawan', position: 'Kanit Siber A', rank: 'Lettu Cba', level: 6, color: 'teal', parentKey: 'hub1' },
  { key: 'h1b', name: 'Lettu Cba Nanda Pratama', position: 'Kanit Siber B', rank: 'Lettu Cba', level: 6, color: 'teal', parentKey: 'hub1' },
  { key: 'h2a', name: 'Lettu Cba Oscar Ferdiansyah', position: 'Kanit Deteksi A', rank: 'Lettu Cba', level: 6, color: 'teal', parentKey: 'hub2' },
  { key: 'h2b', name: 'Lettu Cba Putra Anggara', position: 'Kanit Deteksi B', rank: 'Lettu Cba', level: 6, color: 'teal', parentKey: 'hub2' },
  { key: 'h3a', name: 'Lettu Cba Qori Ramadhan', position: 'Kanit Teknologi A', rank: 'Lettu Cba', level: 6, color: 'teal', parentKey: 'hub3' },
  { key: 'h3b', name: 'Lettu Cba Rian Hidayat', position: 'Kanit Teknologi B', rank: 'Lettu Cba', level: 6, color: 'teal', parentKey: 'hub3' },

  // ---- Level 7: staf di tiap sub-unit ----
  { key: 's1', name: 'Serka Sandi Firmansyah', position: 'Staf Siber', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h1a' },
  { key: 's2', name: 'Serka Taufik Hidayat', position: 'Staf Siber', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h1a' },
  { key: 's3', name: 'Serka Umar Bakri', position: 'Staf Siber', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h1b' },
  { key: 's4', name: 'Serka Vino Pratama', position: 'Staf Siber', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h1b' },
  { key: 's5', name: 'Serka Wahyu Nugroho', position: 'Staf Siber', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h1b' },
  { key: 's6', name: 'Serka Xaverius Adi', position: 'Staf Deteksi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h2a' },
  { key: 's7', name: 'Serka Yoga Pratama', position: 'Staf Deteksi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h2a' },
  { key: 's8', name: 'Serka Zainal Abidin', position: 'Staf Deteksi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h2b' },
  { key: 's9', name: 'Serka Agus Salim', position: 'Staf Deteksi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h2b' },
  { key: 's10', name: 'Serka Bayu Segara', position: 'Staf Teknologi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h3a' },
  { key: 's11', name: 'Serka Chandra Wijaya', position: 'Staf Teknologi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h3a' },
  { key: 's12', name: 'Serka Doni Setiawan', position: 'Staf Teknologi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h3b' },
  { key: 's13', name: 'Serka Erlangga Putra', position: 'Staf Teknologi', rank: 'Serka', level: 7, color: 'teal', parentKey: 'h3b' },

  // ---- Level 8: 1 staf tambahan paling bawah (contoh cabang terdalam) ----
  { key: 's1a', name: 'Sertu Farhan Maulana', position: 'Anggota Siber', rank: 'Sertu', level: 8, color: 'teal', parentKey: 's1' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');

    if (RESET) {
      await OrgStructure.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
      console.log('Semua data org_structures lama sudah dihapus (--reset).');
    }

    // Pakai admin pertama yang ada (kalau sudah pernah `npm run seed`) sebagai
    // pemilik data dummy ini. Kalau belum ada admin sama sekali, admin_id
    // dibiarkan null (kolomnya memang allowNull: true).
    const admin = await Admin.findOne();
    const adminId = admin ? admin.id : null;

    const idMap = {}; // key lokal (mis. 'a1') -> id asli di database
    const displayOrderCounter = {}; // level -> counter urutan horizontal

    for (const node of NODES) {
      const level = node.level;
      displayOrderCounter[level] = (displayOrderCounter[level] || 0) + 1;

      const created = await OrgStructure.create({
        name: node.name,
        position: node.position,
        rank: node.rank,
        level: node.level,
        box_color: node.color,
        parent_id: node.parentKey ? idMap[node.parentKey] : null,
        display_order: displayOrderCounter[level],
        admin_id: adminId,
        // photo dibiarkan kosong (null) -> tampil placeholder ikon di UI
      });

      idMap[node.key] = created.id;
    }

    console.log(`Berhasil membuat ${NODES.length} data dummy struktur organisasi.`);
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat data dummy struktur organisasi:', err.message);
    process.exit(1);
  }
}

seed();
