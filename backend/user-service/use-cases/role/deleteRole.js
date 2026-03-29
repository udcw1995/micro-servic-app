'use strict';

const roleRepository = require('../../repositories/role/RoleRepository');

async function deleteRole(id) {
  const deleted = await roleRepository.delete(id);
  if (!deleted) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Role deleted successfully' };
}

module.exports = deleteRole;
