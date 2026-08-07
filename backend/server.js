require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./models');
const upload = require('./middleware/upload');

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const productRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const faqRoutes = require('./routes/faqRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orgStructureRoutes = require('./routes/orgStructureRoutes');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      },
    },
  })
);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

/**
 * Parsing body request diselesaikan SEKALI di sini, untuk seluruh aplikasi:
 * - JSON / urlencoded biasa -> ditangani express.json()/urlencoded()
 * - multipart/form-data (dipakai saat form mengirim FormData, baik ada file
 *   maupun tidak) -> ditangani multer di sini
 *
 * Dengan begini, route CRUD manapun (termasuk yang tidak upload gambar,
 * seperti FAQ) otomatis bisa membaca req.body dari FormData tanpa perlu
 * menambahkan middleware multer satu per satu di tiap route, dan tidak
 * bergantung pada bagaimana frontend memformat requestnya.
 */
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    upload.any()(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  } else {
    express.json()(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true })(req, res, next);
    });
  }
});

app.use(cookieParser());


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Batasi setiap IP hingga 1000 permintaan per jendela waktu
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload statis (thumbnail berita, gambar produk, foto galeri)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// URL admin API di-noindex secara konsep (tidak ditautkan di navigasi publik)
app.use('/api/auth', authRoutes);
app.use('/api/news', apiLimiter, newsRoutes);
app.use('/api/products', apiLimiter, productRoutes);
app.use('/api/galleries', apiLimiter, galleryRoutes);
app.use('/api/faqs', apiLimiter, faqRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/org-structures', apiLimiter, orgStructureRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Terjadi kesalahan pada server.' 
    : err.message;
  
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');
    await sequelize.sync(); // gunakan migration terpisah untuk production
    app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
  } catch (err) {
    console.error('Gagal terhubung ke database:', err.message);
    process.exit(1);
  }
}

start();
