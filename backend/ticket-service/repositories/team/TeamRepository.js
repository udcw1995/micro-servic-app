'use strict';

const TeamModel = require('../../models/team/TeamModel');
const TeamMemberModel = require('../../models/teamMember/TeamMemberModel');
const Team = require('../../entities/team/Team');

const MEMBERS_INCLUDE = [{ model: TeamMemberModel, as: 'members', attributes: ['userId'] }];

function toEntity(record) {
  return new Team({
    id: record.id,
    title: record.title,
    description: record.description,
    members: record.members ? record.members.map((m) => m.userId) : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

class TeamRepository {
  async create(data) {
    const record = await TeamModel.create(data);
    return toEntity(record);
  }

  async findById(id) {
    const record = await TeamModel.findByPk(id, { include: MEMBERS_INCLUDE });
    if (!record) return null;
    return toEntity(record);
  }

  async findAll() {
    const records = await TeamModel.findAll({ include: MEMBERS_INCLUDE });
    return records.map(toEntity);
  }

  async update(id, updates) {
    const [affectedRows] = await TeamModel.update(updates, { where: { id } });
    if (affectedRows === 0) return null;
    return this.findById(id);
  }

  async delete(id) {
    const deleted = await TeamModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async addMember(teamId, userId) {
    await TeamMemberModel.create({ teamId, userId });
    return this.findById(teamId);
  }

  async removeMember(teamId, userId) {
    const deleted = await TeamMemberModel.destroy({ where: { teamId, userId } });
    return deleted > 0;
  }

  async hasMember(teamId, userId) {
    const record = await TeamMemberModel.findOne({ where: { teamId, userId } });
    return !!record;
  }
}

module.exports = new TeamRepository();
