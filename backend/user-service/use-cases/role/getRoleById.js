'use strict';

const roleRepository = require('../../repositories/role/RoleRepository');

async function getRoleById(id) {
  const role = await roleRepository.findById(id);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    throw error;
  }
  return role;
}

module.exports = getRoleById;
