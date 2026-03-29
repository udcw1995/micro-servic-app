'use strict';

const Role = require('../../entities/role/Role');
const roleRepository = require('../../repositories/role/RoleRepository');

async function createRole({ name, privileges = {} }) {
  const role = new Role({ name, privileges });
  role.validate();

  const existing = await roleRepository.findByName(name);
  if (existing) {
    const error = new Error('A role with this name already exists');
    error.statusCode = 409;
    throw error;
  }

  return roleRepository.create({ name, privileges });
}

module.exports = createRole;
