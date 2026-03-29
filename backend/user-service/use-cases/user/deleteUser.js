'use strict';

const userRepository = require('../../repositories/user/UserRepository');
const AuthServiceClient = require('../../services/AuthServiceClient');

async function deleteUser(id) {
  const deleted = await userRepository.delete(id);
  if (!deleted) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  try {
    await AuthServiceClient.notifyUserDeleted(id);
  } catch (err) {
    console.error('Failed to notify auth-service of user deletion:', err.message);
  }

  return { message: 'User deleted successfully' };
}

module.exports = deleteUser;
