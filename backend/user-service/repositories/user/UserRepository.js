'use strict';

const { Op } = require('sequelize');
const UserModel = require('../../models/user/UserModel');
const User = require('../../entities/user/User');

function toEntity(record) {
  return new User({
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
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
    const record = await UserModel.findByPk(id);
    if (!record) return null;
    return toEntity(record);
  }

  async findByEmail(email) {
    const record = await UserModel.findOne({ where: { email } });
    if (!record) return null;
    return toEntity(record);
  }

  async findAll() {
    const records = await UserModel.findAll();
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
