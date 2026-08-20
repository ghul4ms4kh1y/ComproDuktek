const sequelize = require('../config/database');
const Admin = require('./Admin');
const News = require('./News');
const Product = require('./Product');
const Gallery = require('./Gallery');
const Message = require('./Message');
const OrgStructure = require('./OrgStructure');

const Soldier = require('./Soldier');
const ProgramKerja = require('./ProgramKerja');

// Relasi: audit trail -> admin pembuat konten
Admin.hasMany(News, { foreignKey: 'admin_id' });
News.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Product, { foreignKey: 'admin_id' });
Product.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Gallery, { foreignKey: 'admin_id' });
Gallery.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(ProgramKerja, { foreignKey: 'admin_id' });
ProgramKerja.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(OrgStructure, { foreignKey: 'admin_id' });
OrgStructure.belongsTo(Admin, { foreignKey: 'admin_id' });

// Relasi hierarki
OrgStructure.hasMany(OrgStructure, { as: 'children', foreignKey: 'parent_id' });
OrgStructure.belongsTo(OrgStructure, { as: 'parent', foreignKey: 'parent_id' });

// Relasi OrgStructure ke Soldier (1 jabatan bisa dipegang 1 orang/akun)
OrgStructure.hasOne(Soldier, { foreignKey: 'org_structure_id' });
Soldier.belongsTo(OrgStructure, { foreignKey: 'org_structure_id' });

// Relasi OrgStructure ke ProgramKerja (1 jabatan bisa punya banyak proker)
OrgStructure.hasMany(ProgramKerja, { foreignKey: 'pic_org_structure_id' });
ProgramKerja.belongsTo(OrgStructure, { as: 'pic', foreignKey: 'pic_org_structure_id' });

module.exports = { sequelize, Admin, News, Product, Gallery, Message, OrgStructure, Soldier, ProgramKerja };
