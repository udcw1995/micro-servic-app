'use strict';

const roleRepository = require('../../repositories/role/RoleRepository');

async function getAllRoles() {
  return roleRepository.findAll();
}

module.exports = getAllRoles;
