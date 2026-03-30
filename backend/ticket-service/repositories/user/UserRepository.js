'use strict';

const UserModel = require('../../models/user/UserModel');
const User = require('../../entities/user/User');

function toEntity(record) {
  return new User({
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    roleId: record.roleId,
    roleName: record.roleName,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

class UserRepository {
  async upsert(data) {
    await UserModel.upsert({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      roleId: data.roleId ?? null,
      roleName: data.roleName ?? null,
    });
    return this.findById(data.id);
  }

  async findById(id) {
    const record = await UserModel.findByPk(id);
    if (!record) return null;
    return toEntity(record);
  }

  async findAll() {
    const records = await UserModel.findAll();
    return records.map(toEntity);
  }

  async delete(id) {
    const deleted = await UserModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = new UserRepository();
