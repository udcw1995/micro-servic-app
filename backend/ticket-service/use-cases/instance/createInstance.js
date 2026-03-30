'use strict';

const Instance = require('../../entities/instance/Instance');
const instanceRepository = require('../../repositories/instance/InstanceRepository');
const teamRepository = require('../../repositories/team/TeamRepository');

async function createInstance({ teamId, name, url, appName }) {
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const instance = new Instance({ teamId, name, url, appName });
  instance.validate();

  return instanceRepository.create({ teamId, name, url, appName });
}

module.exports = createInstance;
