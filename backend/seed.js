require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Admin } = require('./models');

async function seed() {
  try {
    await sequelize.sync();

    const existing = await Admin.findOne({ where: { username: process.env.SEED_ADMIN_USERNAME } });
    if (existing) {
      console.log('Admin sudah ada, seed dilewati.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    await Admin.create({
      username: process.env.SEED_ADMIN_USERNAME,
      email: process.env.SEED_ADMIN_EMAIL,
      password: hashed,
      full_name: process.env.SEED_ADMIN_FULLNAME,
    });

    console.log('Admin awal berhasil dibuat:');
    console.log('  Username:', process.env.SEED_ADMIN_USERNAME);
    console.log('  Password:', process.env.SEED_ADMIN_PASSWORD, '(segera ganti setelah login pertama)');
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat admin awal:', err.message);
    process.exit(1);
  }
}

seed();
