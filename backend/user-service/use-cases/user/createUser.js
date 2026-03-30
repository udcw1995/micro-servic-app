'use strict';

const User = require('../../entities/user/User');
const userRepository = require('../../repositories/user/UserRepository');
const { publishUserCreated } = require('../../services/UserEventPublisher');

async function createUser({ firstName, lastName, email, roleId }) {
  const user = new User({ firstName, lastName, email });
  user.validate();

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const created = await userRepository.create({ firstName, lastName, email, roleId });

  // Fetch with role populated so roleName is available in the event
  const fullUser = await userRepository.findById(created.id);

  try {
    await publishUserCreated(fullUser);
  } catch (err) {
    console.error('Failed to publish USER_CREATED event:', err.message);
  }

  return fullUser;
}

module.exports = createUser;
