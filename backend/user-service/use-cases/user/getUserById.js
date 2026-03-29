'use strict';

const userRepository = require('../../repositories/user/UserRepository');

async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

module.exports = getUserById;
