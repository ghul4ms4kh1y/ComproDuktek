const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Sesi tidak ditemukan, silakan login kembali.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Sesi tidak valid atau kedaluwarsa, silakan login kembali.' });
  }
}

module.exports = { requireAuth };
