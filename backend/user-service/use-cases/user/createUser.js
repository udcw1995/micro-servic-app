'use strict';

const User = require('../../entities/user/User');
const userRepository = require('../../repositories/user/UserRepository');

async function createUser({ firstName, lastName, email, roleId }) {
  const user = new User({ firstName, lastName, email });
  user.validate();

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  return userRepository.create({ firstName, lastName, email, roleId });
}

module.exports = createUser;
