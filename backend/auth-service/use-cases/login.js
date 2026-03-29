'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const credentialRepository = require('../services/CredentialRepository');
const UserServiceClient = require('../services/UserServiceClient');

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
}

async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const credential = await credentialRepository.findByEmail(email);
  if (!credential) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, credential.passwordHash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Fetch full user profile from user-service via RabbitMQ
  const user = await UserServiceClient.findById(credential.userId);

  const payload = { userId: user.id, email: user.email };
  const { accessToken, refreshToken } = generateTokens(payload);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

module.exports = login;
