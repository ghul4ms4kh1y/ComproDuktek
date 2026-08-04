/**
 * Factory untuk membuat controller CRUD standar (index, show, create, update, remove)
 * dipakai oleh News, Product, Gallery, Faq. Mengurangi duplikasi kode antar modul.
 */
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
        const payload = { ...req.body };
        if (attachAdmin && req.admin) payload.admin_id = req.admin.id;
        if (req.file) payload[options.fileField || 'image'] = `/uploads/${req.file.filename}`;

        const item = await Model.create(payload);
        res.status(201).json({ message: 'Data berhasil ditambahkan.', data: item });
      } catch (err) {
        res.status(400).json({ message: 'Gagal menambahkan data.', error: err.message });
      }
    },

    async update(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' });

        const payload = { ...req.body };
        if (req.file) payload[options.fileField || 'image'] = `/uploads/${req.file.filename}`;

        await item.update(payload);
        res.json({ message: 'Data berhasil diperbarui.', data: item });
      } catch (err) {
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
        res.status(500).json({ message: 'Gagal menghapus data.', error: err.message });
      }
    },
  };
}

module.exports = crudFactory;
