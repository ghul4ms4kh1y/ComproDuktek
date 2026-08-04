const sequelize = require('../config/database');
const Admin = require('./Admin');
const News = require('./News');
const Product = require('./Product');
const Gallery = require('./Gallery');
const Faq = require('./Faq');
const Message = require('./Message');

// Relasi: audit trail -> admin pembuat konten
Admin.hasMany(News, { foreignKey: 'admin_id' });
News.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Product, { foreignKey: 'admin_id' });
Product.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Gallery, { foreignKey: 'admin_id' });
Gallery.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Faq, { foreignKey: 'admin_id' });
Faq.belongsTo(Admin, { foreignKey: 'admin_id' });

module.exports = { sequelize, Admin, News, Product, Gallery, Faq, Message };
