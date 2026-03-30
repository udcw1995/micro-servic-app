'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');

async function removeMember(teamId, userId) {
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const removed = await teamRepository.removeMember(teamId, userId);
  if (!removed) {
    const error = new Error('User is not a member of this team');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Member removed from team successfully' };
}

module.exports = removeMember;
