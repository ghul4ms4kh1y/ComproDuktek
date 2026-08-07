/**
 * Factory untuk membuat controller CRUD standar (index, show, create, update, remove)
 * dipakai oleh News, Product, Gallery, Faq. Mengurangi duplikasi kode antar modul.
 */
const fs = require('fs');

// Field yang tidak boleh diisi langsung dari body request (dikelola oleh sistem/server).
const PROTECTED_FIELDS = ['id', 'admin_id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'];

function sanitizePayload(body) {
  const payload = { ...body };
  PROTECTED_FIELDS.forEach((f) => delete payload[f]);
  // String kosong pada field opsional (mis. dari FormData) dianggap "tidak diisi" -> jangan kirim,
  // supaya tidak menimpa nilai yang sudah ada atau memicu error tipe data (mis. kolom INTEGER).
  Object.keys(payload).forEach((k) => {
    if (payload[k] === '') delete payload[k];
  });
  return payload;
}

// Middleware global (lihat server.js) memakai upload.any(), sehingga file yang
// terupload berakhir di req.files (array), bukan req.file (single) seperti
// upload.single() per-route. Helper ini mencari file berdasarkan nama field
// yang dikonfigurasi per modul (options.fileField), dan tetap mendukung
// req.file untuk kompatibilitas jika suatu saat dipanggil dari route yang
// masih pakai upload.single() secara eksplisit.
function findUploadedFile(req, fieldName) {
  if (req.file && req.file.fieldname === fieldName) return req.file;
  if (Array.isArray(req.files)) return req.files.find((f) => f.fieldname === fieldName);
  return null;
}

/**
 * Karena upload.any() menerima file dengan nama field apa pun, request bisa
 * saja mengirim file dengan nama field yang salah/typo (atau modul yang
 * memang tidak punya field gambar, mis. FAQ, tapi tetap disisipi file).
 * Fungsi ini menolak request semacam itu dengan pesan yang jelas, alih-alih
 * membiarkan file tersimpan ke disk tanpa pernah tercatat di database.
 * Mengembalikan pesan error (string) jika ada file tak dikenal, atau null
 * jika semua file (kalau ada) sudah sesuai field yang diharapkan.
 */
function validateUploadedFields(req, allowedFieldName) {
  if (!Array.isArray(req.files) || req.files.length === 0) return null;

  const unexpected = req.files.filter((f) => f.fieldname !== allowedFieldName);
  if (unexpected.length === 0) return null;

  const names = [...new Set(unexpected.map((f) => f.fieldname))].join(', ');
  return allowedFieldName
    ? `Field file "${names}" tidak dikenali. Field file yang diterima untuk data ini hanya "${allowedFieldName}".`
    : `Data ini tidak menerima upload file, tetapi menerima field file "${names}".`;
}

// Best-effort: hapus file yang sudah terlanjur tersimpan di disk oleh multer
// saat request ditolak, supaya tidak menumpuk sebagai file "yatim" di /uploads.
function cleanupUploadedFiles(req) {
  if (!Array.isArray(req.files)) return;
  req.files.forEach((f) => {
    fs.unlink(f.path, () => { }); // abaikan error penghapusan, bukan hal kritis
  });
}

function crudFactory(Model, options = {}) {
  const { searchFields = [], defaultOrder = [['created_at', 'DESC']], attachAdmin = false } = options;

  return {
    async index(req, res) {
      try {
        const { Op } = require('sequelize');
        const { q, page = 1, limit = 10 } = req.query;
        const where = {};

        if (q && searchFields.length) {
          where[Op.or] = searchFields.map((f) => ({ [f]: { [Op.like]: `%${q}%` } }));
        }

        const offset = (Number(page) - 1) * Number(limit);
        const { rows, count } = await Model.findAndCountAll({
          where,
          order: defaultOrder,
          limit: Number(limit),
          offset,
        });

        res.json({
          data: rows,
          pagination: { total: count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / limit) },
        });
      } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data.', error: err.message });
      }
    },

    async show(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' });
        res.json({ data: item });
      } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data.', error: err.message });
      }
    },

    async create(req, res) {
      try {
        const fileFieldName = options.fileField || null;
        const validationError = validateUploadedFields(req, fileFieldName);
        if (validationError) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ message: validationError });
        }

        const payload = sanitizePayload(req.body);
        if (attachAdmin && req.admin) payload.admin_id = req.admin.id;
        const file = findUploadedFile(req, fileFieldName || 'image');
        if (file) payload[fileFieldName || 'image'] = `/uploads/${file.filename}`;

        const item = await Model.create(payload);
        res.status(201).json({ message: 'Data berhasil ditambahkan.', data: item });
      } catch (err) {
        // PERBAIKAN DI SINI: Tambahkan error: err.message
        res.status(400).json({ message: 'Gagal menambahkan data.', error: err.message });
      }
    },

    async update(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' });

        const fileFieldName = options.fileField || null;
        const validationError = validateUploadedFields(req, fileFieldName);
        if (validationError) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ message: validationError });
        }

        const payload = sanitizePayload(req.body);
        const file = findUploadedFile(req, fileFieldName || 'image');
        if (file) payload[fileFieldName || 'image'] = `/uploads/${file.filename}`;

        await item.update(payload);
        res.json({ message: 'Data berhasil diperbarui.', data: item });
      } catch (err) {
        // PERBAIKAN DI SINI: Tambahkan error: err.message
        res.status(400).json({ message: 'Gagal memperbarui data.', error: err.message });
      }
    },

    async remove(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' });
        await item.destroy();
        res.json({ message: 'Data berhasil dihapus.' });
      } catch (err) {
        // PERBAIKAN DI SINI: Tambahkan error: err.message
        res.status(500).json({ message: 'Gagal menghapus data.', error: err.message });
      }
    },

    async update(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' });

        const fileFieldName = options.fileField || null;
        const validationError = validateUploadedFields(req, fileFieldName);
        if (validationError) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ message: validationError });
        }

        const payload = sanitizePayload(req.body);
        const file = findUploadedFile(req, fileFieldName || 'image');
        if (file) payload[fileFieldName || 'image'] = `/uploads/${file.filename}`;

        await item.update(payload);
        res.json({ message: 'Data berhasil diperbarui.', data: item });
      } catch (err) {
        res.status(400).json({ message: 'Gagal memperbarui data.' });
      }
    },

    async remove(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' });
        await item.destroy();
        res.json({ message: 'Data berhasil dihapus.' });
      } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus data.' });
      }
    },
  };
}

module.exports = crudFactory;
