const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrgStructure = sequelize.define('OrgStructure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  position: { type: DataTypes.STRING(150), allowNull: false }, // jabatan
  rank: { type: DataTypes.STRING(100), allowNull: true }, // pangkat
  photo: { type: DataTypes.STRING(255), allowNull: true },
  // Level/baris tampilan di bagan (1 = paling atas). Diisi MANUAL oleh admin,
  // tidak lagi dihitung otomatis dari kedalaman parent_id. Admin bebas
  // menentukan siapa ada di baris berapa, termasuk "melompat" beberapa baris
  // dari atasannya.
  level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  // Menunjuk ke id atasan langsung. Sekarang HANYA dipakai untuk menggambar
  // garis penghubung di bagan (dari kotak parent ke kotak ini), TIDAK lagi
  // menentukan posisi/baris (itu tugas field `level`).
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // urutan horizontal dalam 1 level/baris yang sama
  // Warna kotak di bagan (merah = pucuk pimpinan, oranye = pemimpin unit, teal = staf).
  box_color: {
    type: DataTypes.ENUM('merah', 'oranye', 'teal'),
    allowNull: false,
    defaultValue: 'teal',
  },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'org_structures',
});

module.exports = OrgStructure;