'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Must match the UUID used in user-service migration 20260329000005-seed-admin-user.js
const ADMIN_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const ADMIN_EMAIL = 'admin@example.com';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Admin@1234', 10);

    await queryInterface.sequelize.query(
      `INSERT INTO credentials (id, "userId", email, "passwordHash", "createdAt", "updatedAt")
       VALUES (:id, :userId, :email, :passwordHash, :createdAt, :updatedAt)
       ON CONFLICT (email) DO NOTHING`,
      {
        replacements: {
          id: uuidv4(),
          userId: ADMIN_USER_ID,
          email: ADMIN_EMAIL,
          passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('credentials', { email: ADMIN_EMAIL }, {});
  },
};
