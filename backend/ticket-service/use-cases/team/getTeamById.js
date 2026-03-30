'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');

async function getTeamById(id, requestingUser) {
  const team = await teamRepository.findById(id);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  if (!requestingUser.privileges?.canManageTeams) {
    const isMember = await teamRepository.hasMember(id, requestingUser.userId);
    if (!isMember) {
      const error = new Error('Access denied: you are not a member of this team');
      error.statusCode = 403;
      throw error;
    }
  }

  return team;
}

module.exports = getTeamById;
