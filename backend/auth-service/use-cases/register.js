'use strict';

const bcrypt = require('bcryptjs');
const credentialRepository = require('../services/CredentialRepository');
const UserServiceClient = require('../services/UserServiceClient');

const SALT_ROUNDS = 12;

async function register({ firstName, lastName, email, password }) {
  if (!firstName || !lastName || !email || !password) {
    const err = new Error('firstName, lastName, email and password are required');
    err.statusCode = 400;
    throw err;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = new Error('A valid email address is required');
    err.statusCode = 400;
    throw err;
  }
  if (password.length < 8) {
    const err = new Error('Password must be at least 8 characters');
    err.statusCode = 400;
    throw err;
  }

  const existing = await credentialRepository.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // Create the user profile in user-service via RabbitMQ
  const user = await UserServiceClient.create({ firstName, lastName, email });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await credentialRepository.create({ userId: user.id, email, passwordHash });

  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email };
}

module.exports = register;
