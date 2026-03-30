'use strict';

const TeamModel = require('./team/TeamModel');
const TeamMemberModel = require('./teamMember/TeamMemberModel');
const InstanceModel = require('./instance/InstanceModel');

/**
 * Define Sequelize associations between models.
 * Must be called once before any queries that use includes/joins.
 */
function setupAssociations() {
  TeamModel.hasMany(TeamMemberModel, { foreignKey: 'teamId', as: 'members' });
  TeamMemberModel.belongsTo(TeamModel, { foreignKey: 'teamId', as: 'team' });

  TeamModel.hasMany(InstanceModel, { foreignKey: 'teamId', as: 'instances' });
  InstanceModel.belongsTo(TeamModel, { foreignKey: 'teamId', as: 'team' });
}

module.exports = setupAssociations;
