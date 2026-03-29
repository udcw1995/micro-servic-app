'use strict';

const CredentialModel = require('../models/CredentialModel');
const Credential = require('../entities/Credential');

function toEntity(record) {
  return new Credential({
    id: record.id,
    userId: record.userId,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

class CredentialRepository {
  async create({ userId, email, passwordHash }) {
    const record = await CredentialModel.create({ userId, email, passwordHash });
    return toEntity(record);
  }

  async findByEmail(email) {
    const record = await CredentialModel.findOne({ where: { email } });
    if (!record) return null;
    return toEntity(record);
  }

  async findByUserId(userId) {
    const record = await CredentialModel.findOne({ where: { userId } });
    if (!record) return null;
    return toEntity(record);
  }

  async delete(userId) {
    return CredentialModel.destroy({ where: { userId } });
  }
}

module.exports = new CredentialRepository();
