const { JadwalPiket, Soldier, Admin } = require("../models");
const { Op } = require("sequelize");

const getDaysInMonth = (bulan, tahun) => {
  return new Date(tahun, bulan, 0).getDate();
};

const isWorkday = (tahun, bulan, day) => {
  const date = new Date(tahun, bulan - 1, day, 12, 0, 0);
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
};

const getWorkdaysInMonth = (bulan, tahun) => {
  const daysInMonth = getDaysInMonth(bulan, tahun);
  const workdays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    if (isWorkday(tahun, bulan, i)) {
      const date = new Date(tahun, bulan - 1, i, 12, 0, 0);
      workdays.push(date);
    }
  }
  return workdays;
};

const getLastSoldierFromPreviousMonth = async (bulan, tahun) => {
  const prevBulan = bulan === 1 ? 12 : bulan - 1;
  const prevTahun = bulan === 1 ? tahun - 1 : tahun;

  const lastJadwal = await JadwalPiket.findOne({
    where: { bulan: prevBulan, tahun: prevTahun },
    order: [["tanggal_piket", "DESC"]],
    include: [{ model: Soldier, attributes: ["id"] }],
  });

  return lastJadwal ? lastJadwal.soldier_id : null;
};

exports.generate = async (req, res) => {
  try {
    const { bulan, tahun } = req.body;

    if (!bulan || !tahun || bulan < 1 || bulan > 12 || tahun < 2024) {
      return res.status(400).json({
        message: "Bulan dan tahun tidak valid.",
      });
    }

    const existingJadwal = await JadwalPiket.findOne({
      where: { bulan, tahun },
    });

    if (existingJadwal) {
      return res.status(409).json({
        message: "Jadwal piket bulan ini sudah ada. Reset terlebih dahulu jika ingin membuat ulang.",
      });
    }

    const allSoldiers = await Soldier.findAll({
      order: [["id", "ASC"]],
    });

    if (allSoldiers.length === 0) {
      return res.status(400).json({
        message: "Data anggota kosong.",
      });
    }

    const workdays = getWorkdaysInMonth(bulan, tahun);

    let lastSoldierId = await getLastSoldierFromPreviousMonth(bulan, tahun);
    let startIndex = 0;

    if (lastSoldierId) {
      const lastIndex = allSoldiers.findIndex(
        (s) => s.id === lastSoldierId
      );
      startIndex = (lastIndex + 1) % allSoldiers.length;
    }

    const jadwalData = [];
    for (let i = 0; i < workdays.length; i++) {
      const soldierIndex = (startIndex + i) % allSoldiers.length;
      const tanggalPiket = workdays[i].toISOString().split("T")[0];

      jadwalData.push({
        soldier_id: allSoldiers[soldierIndex].id,
        tanggal_piket: tanggalPiket,
        bulan,
        tahun,
        status: "scheduled",
        admin_id: req.user.id,
      });
    }

    const createdJadwal = await JadwalPiket.bulkCreate(jadwalData);

    const sisaAnggota = allSoldiers.length - workdays.length;

    res.status(201).json({
      message: "Jadwal piket berhasil dibuat.",
      data: createdJadwal,
      meta: {
        total_generated: createdJadwal.length,
        sisa_anggota: sisaAnggota > 0 ? sisaAnggota : 0,
      },
    });
  } catch (error) {
    console.error("Error generate jadwal piket:", error);
    res.status(500).json({
      message: "Gagal membuat jadwal piket.",
      error: error.message,
    });
  }
};

exports.index = async (req, res) => {
  try {
    const { bulan, tahun, page = 1, limit = 100, approval_status } = req.query;

    const where = {};
    
    if (approval_status) {
      where.approval_status = approval_status;
    } else {
      if (!bulan || !tahun) {
        return res.status(400).json({
          message: "Bulan dan tahun wajib diisi.",
        });
      }
      where.bulan = parseInt(bulan);
      where.tahun = parseInt(tahun);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await JadwalPiket.findAndCountAll({
      where,
      include: [
        { model: Soldier, attributes: ["id", "full_name", "username"] },
        { model: Admin, attributes: ["id", "full_name"] },
        { model: Admin, as: "reviewer", attributes: ["id", "full_name"] },
      ],
      order: [["tanggal_piket", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in jadwal piket index:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

exports.show = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await JadwalPiket.findByPk(id, {
      include: [
        { model: Soldier, attributes: ["id", "full_name", "username"] },
        { model: Admin, attributes: ["id", "full_name"] },
      ],
    });

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal piket tidak ditemukan.",
      });
    }

    res.json({ data: jadwal });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

exports.showByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const jadwal = await JadwalPiket.findOne({
      where: { tanggal_piket: date },
      include: [
        { model: Soldier, attributes: ["id", "full_name", "username", "photo"] },
        { model: Admin, attributes: ["id", "full_name"] },
      ],
    });

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal piket tidak ditemukan untuk tanggal tersebut.",
      });
    }

    res.json({ data: jadwal });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { soldier_id, status, keterangan } = req.body;

    const jadwal = await JadwalPiket.findByPk(id);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal piket tidak ditemukan.",
      });
    }

    if (soldier_id) {
      const soldierExists = await Soldier.findByPk(soldier_id);
      if (!soldierExists) {
        return res.status(400).json({
          message: "Anggota tidak ditemukan.",
        });
      }

      const duplicateJadwal = await JadwalPiket.findOne({
        where: {
          tanggal_piket: jadwal.tanggal_piket,
          soldier_id,
          id: { [Op.ne]: id },
        },
      });

      if (duplicateJadwal) {
        return res.status(409).json({
          message: "Anggota sudah memiliki jadwal piket di hari tersebut.",
        });
      }

      jadwal.soldier_id = soldier_id;
    }

    if (status) {
      const validStatuses = ["scheduled", "completed", "absent"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Status tidak valid.",
        });
      }
      jadwal.status = status;
    }

    if (keterangan !== undefined) {
      jadwal.keterangan = keterangan;
    }

    await jadwal.save();

    res.json({
      message: "Jadwal piket berhasil diperbarui.",
      data: jadwal,
    });
  } catch (error) {
    console.error("Error update jadwal piket:", error);
    res.status(500).json({
      message: "Gagal memperbarui jadwal piket.",
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await JadwalPiket.findByPk(id);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal piket tidak ditemukan.",
      });
    }

    await jadwal.destroy();

    res.json({
      message: "Jadwal piket berhasil dihapus.",
    });
  } catch (error) {
    console.error("Error delete jadwal piket:", error);
    res.status(500).json({
      message: "Gagal menghapus jadwal piket.",
    });
  }
};

exports.reset = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;

    if (!bulan || !tahun) {
      return res.status(400).json({
        message: "Bulan dan tahun wajib diisi.",
      });
    }

    const deletedCount = await JadwalPiket.destroy({
      where: { bulan: parseInt(bulan), tahun: parseInt(tahun) },
    });

    res.json({
      message: "Jadwal piket berhasil direset.",
      deleted_count: deletedCount,
    });
  } catch (error) {
    console.error("Error reset jadwal piket:", error);
    res.status(500).json({
      message: "Gagal mereset jadwal piket.",
      error: error.message,
    });
  }
};

exports.calendar = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;

    if (!bulan || !tahun) {
      return res.status(400).json({
        message: "Bulan dan tahun wajib diisi.",
      });
    }

    const jadwals = await JadwalPiket.findAll({
      where: {
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
      },
      include: [
        { model: Soldier, attributes: ["id", "full_name", "username"] },
        { model: Admin, attributes: ["id", "full_name"] },
        { model: Admin, as: "reviewer", attributes: ["id", "full_name"] },
      ],
      order: [["tanggal_piket", "ASC"]],
    });

    res.json({
      data: jadwals,
    });
  } catch (error) {
    console.error("Error fetch calendar jadwal piket:", error);
    res.status(500).json({
      message: "Gagal memuat kalender jadwal piket.",
      error: error.message,
    });
  }
};

exports.ajukanUsulanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;
    const soldierIdFromToken = req.user.id;

    const jadwal = await JadwalPiket.findByPk(id, {
      include: [{ model: Soldier, attributes: ["id"] }],
    });

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal piket tidak ditemukan.",
      });
    }

    if (jadwal.soldier_id !== soldierIdFromToken) {
      return res.status(403).json({
        message: "Anda tidak berhak mengajukan usulan untuk jadwal ini.",
      });
    }

    if (!status || !['completed', 'absent'].includes(status)) {
      return res.status(400).json({
        message: "Status harus 'completed' atau 'absent'.",
      });
    }

    if (status === 'absent' && !keterangan) {
      return res.status(400).json({
        message: "Keterangan wajib diisi jika status 'absent'.",
      });
    }

    if (jadwal.approval_status === 'pending') {
      return res.status(409).json({
        message: "Sudah ada usulan yang menunggu persetujuan admin.",
      });
    }

    jadwal.status_usulan = status;
    jadwal.keterangan_usulan = keterangan || null;
    jadwal.approval_status = 'pending';
    await jadwal.save();

    res.json({
      message: "Usulan status jadwal piket berhasil diajukan.",
      data: jadwal,
    });
  } catch (error) {
    console.error("Error ajukan usulan status:", error);
    res.status(500).json({
      message: "Gagal mengajukan usulan status.",
      error: error.message,
    });
  }
};

exports.reviewUsulanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const adminIdFromToken = req.user.id;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        message: "Action harus 'approve' atau 'reject'.",
      });
    }

    const jadwal = await JadwalPiket.findByPk(id);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal piket tidak ditemukan.",
      });
    }

    if (jadwal.approval_status !== 'pending') {
      return res.status(409).json({
        message: "Tidak ada usulan yang menunggu persetujuan.",
      });
    }

    if (action === 'approve') {
      jadwal.status = jadwal.status_usulan;
      jadwal.keterangan = jadwal.keterangan_usulan;
      jadwal.approval_status = 'approved';
    } else {
      jadwal.approval_status = 'rejected';
    }

    jadwal.reviewed_by_admin_id = adminIdFromToken;
    await jadwal.save();

    res.json({
      message: `Usulan jadwal piket berhasil di${action === 'approve' ? 'setujui' : 'tolak'}.`,
      data: jadwal,
    });
  } catch (error) {
    console.error("Error review usulan status:", error);
    res.status(500).json({
      message: "Gagal mereview usulan status.",
      error: error.message,
    });
  }
};
