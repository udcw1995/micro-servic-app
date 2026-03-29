'use strict';

const jwt = require('jsonwebtoken');

async function refreshToken({ token }) {
  if (!token) {
    const err = new Error('Refresh token is required');
    err.statusCode = 400;
    throw err;
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const { userId, email } = payload;
  const accessToken = jwt.sign({ userId, email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

  return { accessToken };
}

module.exports = refreshToken;
