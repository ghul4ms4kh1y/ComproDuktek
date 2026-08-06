const sequelize = require('../config/database');
const Admin = require('./Admin');
const News = require('./News');
const Product = require('./Product');
const Gallery = require('./Gallery');
const Faq = require('./Faq');
const Message = require('./Message');
const OrgStructure = require('./OrgStructure');

// Relasi: audit trail -> admin pembuat konten
Admin.hasMany(News, { foreignKey: 'admin_id' });
News.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Product, { foreignKey: 'admin_id' });
Product.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Gallery, { foreignKey: 'admin_id' });
Gallery.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Faq, { foreignKey: 'admin_id' });
Faq.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(OrgStructure, { foreignKey: 'admin_id' });
OrgStructure.belongsTo(Admin, { foreignKey: 'admin_id' });

// Relasi hierarki: 1 orang bisa punya banyak bawahan langsung (children),
// dan 1 orang punya paling banyak 1 atasan langsung (parent).
OrgStructure.hasMany(OrgStructure, { as: 'children', foreignKey: 'parent_id' });
OrgStructure.belongsTo(OrgStructure, { as: 'parent', foreignKey: 'parent_id' });

module.exports = { sequelize, Admin, News, Product, Gallery, Faq, Message, OrgStructure };
