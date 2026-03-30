'use strict';

const instanceRepository = require('../../repositories/instance/InstanceRepository');

async function deleteInstance(id) {
  const deleted = await instanceRepository.delete(id);
  if (!deleted) {
    const error = new Error('Instance not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Instance deleted successfully' };
}

module.exports = deleteInstance;
