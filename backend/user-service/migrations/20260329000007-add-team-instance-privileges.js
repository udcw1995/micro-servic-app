'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add canManageTeams and canManageInstances to the admin role only;
    // all other roles get false by default (JSONB || operator merges).
    await queryInterface.sequelize.query(`
      UPDATE roles
      SET privileges = privileges || '{"canManageTeams": true, "canManageInstances": true}'::jsonb
      WHERE name = 'admin';
    `);

    await queryInterface.sequelize.query(`
      UPDATE roles
      SET privileges = privileges || '{"canManageTeams": false, "canManageInstances": false}'::jsonb
      WHERE name != 'admin';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE roles
      SET privileges = privileges - 'canManageTeams' - 'canManageInstances';
    `);
  },
};
