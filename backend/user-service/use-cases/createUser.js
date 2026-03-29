'use strict';

const User = require('../entities/User');
const userRepository = require('../services/UserRepository');

async function createUser({ firstName, lastName, email }) {
  const user = new User({ firstName, lastName, email });
  user.validate();

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  return userRepository.create({ firstName, lastName, email });
}

module.exports = createUser;
