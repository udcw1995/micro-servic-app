'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');

async function getAllTeams() {
  return teamRepository.findAll();
}

module.exports = getAllTeams;
