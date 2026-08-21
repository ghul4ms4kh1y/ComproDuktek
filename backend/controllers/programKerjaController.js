const { ProgramKerja, OrgStructure, Soldier } = require("../models");
const { Op } = require("sequelize");
const computeProkerStatus = require("../utils/computeProkerStatus");

exports.index = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    // Search filter
    if (q) {
      where[Op.or] = [
        { program: { [Op.iLike]: `%${q}%` } },
        { keterangan: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { rows, count } = await ProgramKerja.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      include: [
        {
          model: OrgStructure,
          as: "pic",
          attributes: ["id", "name", "position", "rank"],
        },
      ],
    });

    // Compute status
    let data = rows.map((row) => {
      const plain = row.get({ plain: true });
      plain.status = computeProkerStatus(plain.is_selesai, plain.deadline);
      return plain;
    });

    // Filter by computed status if requested
    if (status) {
      data = data.filter((item) => item.status === status);
      // Note: This makes count and pagination slightly inaccurate if filtered by status,
      // but for simplicity we filter after query. To fix it properly we'd need complex queries.
    }

    res.json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in ProgramKerja index:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.show = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };

    const item = await ProgramKerja.findOne({
      where,
      include: [
        {
          model: OrgStructure,
          as: "pic",
          attributes: ["id", "name", "position", "rank"],
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    const plain = item.get({ plain: true });
    plain.status = computeProkerStatus(plain.is_selesai, plain.deadline);

    res.json({ data: plain });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.admin_id = req.user.id;

    payload.is_selesai = payload.is_selesai === "true" || payload.is_selesai === true;

    if (!payload.pic_org_structure_id) {
      payload.pic_org_structure_id = null;
    }

    // Pastikan jika kosong, mutlak jadi null, BUKAN string kosong
    if (!payload.tanggal_selesai) payload.tanggal_selesai = null;
    if (!payload.alasan_keterlambatan) payload.alasan_keterlambatan = null;

    const newItem = await ProgramKerja.create(payload);
    res.status(201).json({ message: "Data berhasil dibuat.", data: newItem });
  } catch (error) {
    console.error("Error saat create proker:", error);
    res.status(500).json({
      message: "Gagal membuat data.",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    const payload = { ...req.body };

    // Convert is_selesai to boolean
    payload.is_selesai = payload.is_selesai === "true" || payload.is_selesai === true;

    if (!payload.pic_org_structure_id) {
      payload.pic_org_structure_id = null;
    }

    // Trik Mencegah Error DB: Ubah string kosong menjadi NULL
    if (payload.tanggal_selesai !== undefined) {
      if (
        payload.tanggal_selesai === null ||
        payload.tanggal_selesai.trim() === ""
      ) {
        payload.tanggal_selesai = null;
      }
    }

    // Auto-fill tanggal selesai jika dichecklist "is_selesai" tapi lupa isi tanggal
    if (payload.is_selesai && !payload.tanggal_selesai) {
      const today = new Date();
      payload.tanggal_selesai = today.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    // Validate alasan_keterlambatan
    const isSelesaiVal =
      payload.is_selesai !== undefined ? payload.is_selesai : item.is_selesai;
    const deadlineVal =
      payload.deadline !== undefined ? payload.deadline : item.deadline;

    const computedStatus = computeProkerStatus(isSelesaiVal, deadlineVal);

    if (
      computedStatus === "merah" &&
      (!payload.alasan_keterlambatan ||
        payload.alasan_keterlambatan.trim() === "")
    ) {
      return res.status(400).json({
        message:
          "Alasan keterlambatan wajib diisi karena status proker Terlambat (MERAH).",
      });
    }

    await item.update(payload);
    res.json({ message: "Data berhasil diperbarui.", data: item });
  } catch (error) {
    console.error("Error updating program kerja:", error);
    res.status(500).json({ message: "Gagal memperbarui data." });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    await item.destroy();
    res.json({ message: "Data berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus data." });
  }
};

exports.soldierUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const soldier = await Soldier.findByPk(req.user.id);

    const item = await ProgramKerja.findOne({
      where: { id, pic_org_structure_id: soldier.org_structure_id },
    });

    if (!item) {
      return res
        .status(404)
        .json({
          message: "Program kerja tidak ditemukan atau bukan milik Anda.",
        });
    }

    const { is_selesai, tanggal_selesai } = req.body;

    item.is_selesai = is_selesai !== undefined ? is_selesai : item.is_selesai;

    if (item.is_selesai && !tanggal_selesai) {
      item.tanggal_selesai = new Date().toISOString().split("T")[0];
    } else {
      item.tanggal_selesai = tanggal_selesai || null;
    }

    await item.save();
    res.json({
      message: "Status program kerja berhasil diperbarui.",
      data: item,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui status.", error: error.message });
  }
};
