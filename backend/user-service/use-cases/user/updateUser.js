'use strict';

const User = require('../../entities/user/User');
const userRepository = require('../../repositories/user/UserRepository');

async function updateUser(id, { firstName, lastName, email, avatarUrl, roleId }) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (email !== undefined) updates.email = email;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (roleId !== undefined) updates.roleId = roleId;

  // Validate the merged state
  const merged = new User({ ...existing, ...updates });
  merged.validate();

  // If email is changing, ensure it's not already taken by another user
  if (email !== undefined && email !== existing.email) {
    const emailOwner = await userRepository.findByEmail(email);
    if (emailOwner) {
      const error = new Error('A user with this email already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  return userRepository.update(id, updates);
}

module.exports = updateUser;
