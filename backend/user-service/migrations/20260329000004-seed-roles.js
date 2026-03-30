'use strict';

const { v4: uuidv4 } = require('uuid');

const adminPrivileges = {
  canCreateUser: true,
  canDeleteUser: true,
  canManageRoles: true,
  canEditAnyUser: true,
  canManageTeams: true,
  canManageInstances: true,
};

const developerPrivileges = {
  canCreateUser: false,
  canDeleteUser: false,
  canManageRoles: false,
  canEditAnyUser: false,
  canManageTeams: false,
  canManageInstances: false,
};

const userPrivileges = {
  canCreateUser: false,
  canDeleteUser: false,
  canManageRoles: false,
  canEditAnyUser: false,
  canManageTeams: false,
  canManageInstances: false,
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      {
        id: uuidv4(),
        name: 'admin',
        privileges: JSON.stringify(adminPrivileges),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: 'developer',
        privileges: JSON.stringify(developerPrivileges),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: 'user',
        privileges: JSON.stringify(userPrivileges),
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { name: ['admin', 'developer', 'user'] }, {});
  },
};
