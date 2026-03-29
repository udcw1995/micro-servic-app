'use strict';

const userRepository = require('../../repositories/user/UserRepository');

async function getAllUsers() {
  return userRepository.findAll();
}

module.exports = getAllUsers;
