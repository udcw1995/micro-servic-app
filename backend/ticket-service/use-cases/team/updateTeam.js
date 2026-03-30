'use strict';

const Team = require('../../entities/team/Team');
const teamRepository = require('../../repositories/team/TeamRepository');

async function updateTeam(id, { title, description }) {
  const existing = await teamRepository.findById(id);
  if (!existing) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;

  const merged = new Team({ ...existing, ...updates });
  merged.validate();

  return teamRepository.update(id, updates);
}

module.exports = updateTeam;
