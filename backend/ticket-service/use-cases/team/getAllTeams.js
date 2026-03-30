'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');

async function getAllTeams(requestingUser) {
  if (requestingUser.privileges?.canManageTeams) {
    return teamRepository.findAll();
  }
  return teamRepository.findAllByMember(requestingUser.userId);
}

module.exports = getAllTeams;
