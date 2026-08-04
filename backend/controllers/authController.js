const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

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

    const { Op } = require('sequelize');
    const admin = await Admin.findOne({
      where: { [Op.or]: [{ username: identifier }, { email: identifier }] },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Username/email atau password salah.' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Username/email atau password salah.' });
    }

    const payload = { id: admin.id, username: admin.username, full_name: admin.full_name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    res.cookie('token', token, cookieOptions());
    res.json({ message: 'Login berhasil.', admin: payload, token });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout berhasil.' });
};

exports.me = async (req, res) => {
  res.json({ admin: req.admin });
};
