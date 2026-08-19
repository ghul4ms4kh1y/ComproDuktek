const bcrypt = require('bcryptjs');
const { Soldier, OrgStructure } = require('../models');

// === UNTUK SOLDIER (USER BIASA) ===

// User update profile (misalnya ganti password)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // didapat dari middleware auth
    const { password, oldPassword } = req.body;

    const soldier = await Soldier.findByPk(userId);
    if (!soldier) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Password lama wajib diisi untuk mengganti password baru' });
      }
      const valid = await bcrypt.compare(oldPassword, soldier.password);
      if (!valid) {
        return res.status(401).json({ message: 'Password lama salah' });
      }
      soldier.password = await bcrypt.hash(password, 10);
    }

    await soldier.save();
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// === UNTUK ADMIN ===

// Mendapatkan semua anggota (Soldier) beserta jabatannya
exports.getAllSoldiers = async (req, res) => {
  try {
    const soldiers = await Soldier.findAll({
      include: [
        { model: OrgStructure, attributes: ['position'] }
      ],
      attributes: { exclude: ['password'] } // Jangan kirim password
    });
    res.json(soldiers);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// Mendapatkan detail satu anggota
exports.getSoldierById = async (req, res) => {
  try {
    const soldier = await Soldier.findByPk(req.params.id, {
      include: [
        { model: OrgStructure, attributes: ['position'] }
      ],
      attributes: { exclude: ['password'] }
    });
    if (!soldier) return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    res.json(soldier);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// Update data anggota oleh admin (reset password atau ganti username)
exports.updateSoldier = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, password } = req.body;

    const soldier = await Soldier.findByPk(id);
    if (!soldier) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }

    if (username) {
      // Cek apakah username sudah dipakai orang lain
      const existing = await Soldier.findOne({ where: { username } });
      if (existing && existing.id !== soldier.id) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
      soldier.username = username;
    }
    if (full_name) {
      soldier.full_name = full_name;
    }
    if (password) {
      soldier.password = await bcrypt.hash(password, 10);
    }

    await soldier.save();
    res.json({ message: 'Data anggota berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};
