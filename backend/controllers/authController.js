const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Soldier } = require('../models');
const { Op } = require('sequelize');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 jam
});

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username atau email
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/email dan password wajib diisi.' });
    }

    // Coba cari di tabel Admin dulu
    let user = await Admin.findOne({
      where: { [Op.or]: [{ username: identifier }, { email: identifier }] },
    });
    let role = 'admin';

    // Jika tidak ketemu di Admin, cari di Soldier
    if (!user) {
      user = await Soldier.findOne({
        where: { username: identifier }
      });
      role = 'soldier';
    }

    if (!user) {
      return res.status(401).json({ message: 'Username/email atau password salah.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Username/email atau password salah.' });
    }

    const payload = { 
      id: user.id, 
      username: user.username, 
      full_name: user.full_name,
      role: role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    res.cookie('token', token, cookieOptions());
    res.json({ message: 'Login berhasil.', user: payload, token });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout berhasil.' });
};

exports.me = async (req, res) => {
  // middleware auth harusnya sudah set req.user atau req.admin
  res.json({ user: req.user || req.admin });
};
