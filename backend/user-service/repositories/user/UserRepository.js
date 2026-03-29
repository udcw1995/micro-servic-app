'use strict';

const { Op } = require('sequelize');
const UserModel = require('../../models/user/UserModel');
const RoleModel = require('../../models/role/RoleModel');
const User = require('../../entities/user/User');

const ROLE_INCLUDE = [{ model: RoleModel, as: 'role', attributes: ['id', 'name'] }];

function toEntity(record) {
  return new User({
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    roleId: record.roleId,
    role: record.role ? { id: record.role.id, name: record.role.name } : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

class UserRepository {
  async create(userData) {
    const record = await UserModel.create(userData);
    return toEntity(record);
  }

  async findById(id) {
    const record = await UserModel.findByPk(id, { include: ROLE_INCLUDE });
    if (!record) return null;
    return toEntity(record);
  }

  async findByEmail(email) {
    const record = await UserModel.findOne({ where: { email }, include: ROLE_INCLUDE });
    if (!record) return null;
    return toEntity(record);
  }

  async findAll() {
    const records = await UserModel.findAll({ include: ROLE_INCLUDE });
    return records.map(toEntity);
  }

  async update(id, updates) {
    const [affectedRows] = await UserModel.update(updates, { where: { id } });
    if (affectedRows === 0) return null;
    return this.findById(id);
  }

  async delete(id) {
    const deleted = await UserModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = new UserRepository();
