const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalPiket = sequelize.define('JadwalPiket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  soldier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tanggal_piket: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  bulan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'absent'),
    defaultValue: 'scheduled',
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'jadwal_pikets',
  underscored: true,
  timestamps: true,
});

module.exports = JadwalPiket;
