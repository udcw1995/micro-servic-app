'use strict';

const userRepository = require('../services/UserRepository');

async function getAllUsers() {
  return userRepository.findAll();
}

module.exports = getAllUsers;
