const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  thumbnail: { type: DataTypes.STRING(255), allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  news_date: { type: DataTypes.DATEONLY, allowNull: false },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'news',
});

module.exports = News;
