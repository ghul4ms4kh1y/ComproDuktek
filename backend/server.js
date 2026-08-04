require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const productRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const faqRoutes = require('./routes/faqRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// File upload statis (thumbnail berita, gambar produk, foto galeri)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// URL admin API di-noindex secara konsep (tidak ditautkan di navigasi publik)
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Terjadi kesalahan pada server.' });
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
