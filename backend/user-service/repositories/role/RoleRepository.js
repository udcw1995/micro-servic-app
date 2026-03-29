'use strict';

const RoleModel = require('../../models/role/RoleModel');
const Role = require('../../entities/role/Role');

function toEntity(record) {
  return new Role({
    id: record.id,
    name: record.name,
    privileges: record.privileges,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

class RoleRepository {
  async create(data) {
    const record = await RoleModel.create(data);
    return toEntity(record);
  }

  async findById(id) {
    const record = await RoleModel.findByPk(id);
    if (!record) return null;
    return toEntity(record);
  }

  async findByName(name) {
    const record = await RoleModel.findOne({ where: { name } });
    if (!record) return null;
    return toEntity(record);
  }

  async findAll() {
    const records = await RoleModel.findAll();
    return records.map(toEntity);
  }

  async update(id, updates) {
    const [affectedRows] = await RoleModel.update(updates, { where: { id } });
    if (affectedRows === 0) return null;
    return this.findById(id);
  }

  async delete(id) {
    const deleted = await RoleModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = new RoleRepository();
