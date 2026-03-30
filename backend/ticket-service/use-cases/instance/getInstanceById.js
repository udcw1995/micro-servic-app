'use strict';

const instanceRepository = require('../../repositories/instance/InstanceRepository');
const teamRepository = require('../../repositories/team/TeamRepository');

async function getInstanceById(id, requestingUser) {
  const instance = await instanceRepository.findById(id);
  if (!instance) {
    const error = new Error('Instance not found');
    error.statusCode = 404;
    throw error;
  }

  if (!requestingUser.privileges?.canManageInstances) {
    const isMember = await teamRepository.hasMember(instance.teamId, requestingUser.userId);
    if (!isMember) {
      const error = new Error('Access denied: you are not a member of this team');
      error.statusCode = 403;
      throw error;
    }
  }

  return instance;
}

module.exports = getInstanceById;
