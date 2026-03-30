'use strict';

const InstanceModel = require('../../models/instance/InstanceModel');
const Instance = require('../../entities/instance/Instance');

function toEntity(record) {
  return new Instance({
    id: record.id,
    teamId: record.teamId,
    name: record.name,
    url: record.url,
    appName: record.appName,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

class InstanceRepository {
  async create(data) {
    const record = await InstanceModel.create(data);
    return toEntity(record);
  }

  async findById(id) {
    const record = await InstanceModel.findByPk(id);
    if (!record) return null;
    return toEntity(record);
  }

  async findAllByTeamId(teamId) {
    const records = await InstanceModel.findAll({ where: { teamId } });
    return records.map(toEntity);
  }

  async update(id, updates) {
    const [affectedRows] = await InstanceModel.update(updates, { where: { id } });
    if (affectedRows === 0) return null;
    return this.findById(id);
  }

  async delete(id) {
    const deleted = await InstanceModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = new InstanceRepository();
