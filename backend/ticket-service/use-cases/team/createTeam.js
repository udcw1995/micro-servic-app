'use strict';

const Team = require('../../entities/team/Team');
const teamRepository = require('../../repositories/team/TeamRepository');

async function createTeam({ title, description }) {
  const team = new Team({ title, description });
  team.validate();

  return teamRepository.create({ title, description });
}

module.exports = createTeam;
