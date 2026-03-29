'use strict';

// Fixed UUID shared with the auth-service credential seeder
const ADMIN_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

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
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          roleId: adminRoleId,
          createdAt: now,
          updatedAt: now,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { id: ADMIN_USER_ID }, {});
  },
};
