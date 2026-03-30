'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');

async function getTeamById(id) {
  const team = await teamRepository.findById(id);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }
  return team;
}

module.exports = getTeamById;
