'use strict';

const Role = require('../../entities/role/Role');
const roleRepository = require('../../repositories/role/RoleRepository');

async function updateRole(id, { name, privileges }) {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (privileges !== undefined) updates.privileges = privileges;

  const merged = new Role({ ...existing, ...updates });
  merged.validate();

  if (name !== undefined && name !== existing.name) {
    const nameOwner = await roleRepository.findByName(name);
    if (nameOwner) {
      const error = new Error('A role with this name already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  return roleRepository.update(id, updates);
}

module.exports = updateRole;
