'use strict';

const teamRepository = require('../../repositories/team/TeamRepository');

async function deleteTeam(id) {
  const deleted = await teamRepository.delete(id);
  if (!deleted) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Team deleted successfully' };
}

module.exports = deleteTeam;
