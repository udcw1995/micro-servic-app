'use strict';

const instanceRepository = require('../../repositories/instance/InstanceRepository');
const teamRepository = require('../../repositories/team/TeamRepository');

async function getAllInstancesByTeam(teamId, requestingUser) {
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  if (!requestingUser.privileges?.canManageInstances) {
    const isMember = await teamRepository.hasMember(teamId, requestingUser.userId);
    if (!isMember) {
      const error = new Error('Access denied: you are not a member of this team');
      error.statusCode = 403;
      throw error;
    }
  }

  return instanceRepository.findAllByTeamId(teamId);
}

module.exports = getAllInstancesByTeam;
