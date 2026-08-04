const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faq = sequelize.define('Faq', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question: { type: DataTypes.STRING(255), allowNull: false },
  answer: { type: DataTypes.TEXT, allowNull: false },
  display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'faqs',
});

module.exports = Faq;
