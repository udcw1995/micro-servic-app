'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');
const userRepository = require('../../repositories/user/UserRepository');

async function assignMember(teamId, userId) {
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify the user exists in the local read-model (synced from user-service)
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyMember = await teamRepository.hasMember(teamId, userId);
  if (alreadyMember) {
    const error = new Error('User is already a member of this team');
    error.statusCode = 409;
    throw error;
  }

  return teamRepository.addMember(teamId, userId);
}

module.exports = assignMember;
