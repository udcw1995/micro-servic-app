'use strict';

require('dotenv').config();

const ADMIN_USER_ID   = process.env.ADMIN_USER_ID   || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin';
const ADMIN_LAST_NAME  = process.env.ADMIN_LAST_NAME  || 'User';
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL      || 'admin@example.com';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1"
    );
    if (!roles.length) {
      throw new Error('Admin role not found. Ensure the roles migration has run first.');
    }
    const adminRoleId = roles[0].id;

    await queryInterface.sequelize.query(
      `INSERT INTO users (id, "firstName", "lastName", email, "roleId", "createdAt", "updatedAt")
       VALUES (:id, :firstName, :lastName, :email, :roleId, :createdAt, :updatedAt)
       ON CONFLICT (email) DO NOTHING`,
      {
        replacements: {
          id: ADMIN_USER_ID,
          firstName: ADMIN_FIRST_NAME,
          lastName: ADMIN_LAST_NAME,
          email: ADMIN_EMAIL,
          roleId: adminRoleId,
          createdAt: now,
          updatedAt: now,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ADMIN_EMAIL }, {});
  },
};
