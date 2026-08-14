const { sequelize, OrgStructure } = require('../models');

/**
 * Menghapus 1 anggota. Kalau anggota ini punya bawahan langsung, parent_id
 * bawahan-bawahan tersebut dikosongkan dulu (bukan ikut terhapus) supaya
 * tidak ada data yang menunjuk ke ID yang sudah tidak ada di database.
 */
exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const item = await OrgStructure.findByPk(req.params.id, { transaction: t });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }

    await OrgStructure.update(
      { parent_id: null },
      { where: { parent_id: item.id }, transaction: t }
    );
    await item.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Data berhasil dihapus.' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal menghapus data.', error: err.message });
  }
};

/**
 * Menyimpan ulang urutan (display_order) sesama anggota dalam 1 LEVEL/baris
 * yang sama (bukan lagi berdasarkan parent_id — urutan horizontal kini bebas
 * per level, tidak harus dekat dengan atasannya). Dibungkus transaction
 * supaya urutan tidak setengah jadi kalau ada yang gagal di tengah proses.
 * Body: { level: number, order: [id2, id1, id3, ...] }
 */
exports.reorder = async (req, res) => {
  const { level, order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'Data urutan tidak valid.' });
  }

  const ids = order.map((id) => Number(id));
  if (ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ message: 'Data urutan berisi ID yang tidak valid.' });
  }

  const lvl = Number(level);
  if (!Number.isInteger(lvl)) {
    return res.status(400).json({ message: 'Level tidak valid.' });
  }

  const t = await sequelize.transaction();
  try {
    const count = await OrgStructure.count({ where: { id: ids, level: lvl }, transaction: t });
    if (count !== ids.length) {
      await t.rollback();
      return res.status(400).json({
        message: 'Data pada urutan ini tidak konsisten dengan levelnya. Silakan muat ulang halaman.',
      });
    }

    await Promise.all(
      ids.map((id, index) => OrgStructure.update({ display_order: index + 1 }, { where: { id }, transaction: t }))
    );

    await t.commit();

    const updated = await OrgStructure.findAll({ order: [['level', 'ASC'], ['display_order', 'ASC']] });
    res.json({ message: 'Urutan berhasil diperbarui.', data: updated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal memperbarui urutan.', error: err.message });
  }
};