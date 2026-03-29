'use strict';

const userRepository = require('../services/UserRepository');

async function deleteUser(id) {
  const deleted = await userRepository.delete(id);
  if (!deleted) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'User deleted successfully' };
}

module.exports = deleteUser;
