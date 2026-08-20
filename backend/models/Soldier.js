const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Soldier = sequelize.define('Soldier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  full_name: { type: DataTypes.STRING(150), allowNull: true },
  photo: { type: DataTypes.STRING(255), allowNull: true },
  org_structure_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'soldiers',
});

module.exports = Soldier;
