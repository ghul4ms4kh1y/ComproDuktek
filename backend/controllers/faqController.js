const { sequelize, Faq } = require('../models');

/**
 * Menerima array ID FAQ sesuai urutan baru hasil drag-and-drop di admin,
 * lalu menyimpan ulang display_order tiap item (dimulai dari 1) sesuai
 * posisinya dalam array tersebut.
 * Body: { order: [id3, id1, id2, ...] }
 *
 * Dibungkus dalam transaction: kalau salah satu update gagal di tengah
 * proses (mis. koneksi terputus), SEMUA perubahan dibatalkan (rollback)
 * supaya display_order antar FAQ tidak pernah berakhir setengah baru
 * setengah lama / tidak konsisten.
 */
exports.reorder = async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'Data urutan tidak valid.' });
  }

  const ids = order.map((id) => Number(id));
  if (ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ message: 'Data urutan berisi ID yang tidak valid.' });
  }

  const t = await sequelize.transaction();
  try {
    // Pastikan semua ID yang dikirim benar-benar masih ada, sebelum mengubah apa pun.
    // Mencegah urutan berakhir tidak lengkap kalau ada FAQ yang terhapus
    // oleh admin lain tepat saat drag-and-drop sedang berlangsung.
    const existingCount = await Faq.count({ where: { id: ids }, transaction: t });
    if (existingCount !== ids.length) {
      await t.rollback();
      return res.status(400).json({
        message: 'Sebagian data FAQ pada urutan ini tidak ditemukan (mungkin sudah dihapus). Silakan muat ulang halaman.',
      });
    }

    await Promise.all(
      ids.map((id, index) => Faq.update({ display_order: index + 1 }, { where: { id }, transaction: t }))
    );

    await t.commit();

    const updated = await Faq.findAll({ order: [['display_order', 'ASC']] });
    res.json({ message: 'Urutan FAQ berhasil diperbarui.', data: updated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal memperbarui urutan FAQ.', error: err.message });
  }
};
