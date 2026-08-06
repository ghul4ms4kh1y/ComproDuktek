const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrgStructure = sequelize.define('OrgStructure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  position: { type: DataTypes.STRING(150), allowNull: false }, // jabatan
  rank: { type: DataTypes.STRING(100), allowNull: true }, // pangkat
  photo: { type: DataTypes.STRING(255), allowNull: true },
  // Menunjuk ke id atasan langsung. NULL = posisi paling atas (mis. Dansatlak).
  // Inilah yang membuat bagan bisa tersusun otomatis tanpa admin mengatur posisi manual.
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
