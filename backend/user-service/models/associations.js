'use strict';

const UserModel = require('./user/UserModel');
const RoleModel = require('./role/RoleModel');

/**
 * Define Sequelize associations between models.
 * Must be called once before any queries that use includes/joins.
 */
function setupAssociations() {
  UserModel.belongsTo(RoleModel, { foreignKey: 'roleId', as: 'role' });
  RoleModel.hasMany(UserModel, { foreignKey: 'roleId', as: 'users' });
}

module.exports = setupAssociations;
