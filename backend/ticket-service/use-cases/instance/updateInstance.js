'use strict';

const Instance = require('../../entities/instance/Instance');
const instanceRepository = require('../../repositories/instance/InstanceRepository');

async function updateInstance(id, { name, url, appName }) {
  const existing = await instanceRepository.findById(id);
  if (!existing) {
    const error = new Error('Instance not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (url !== undefined) updates.url = url;
  if (appName !== undefined) updates.appName = appName;

  const merged = new Instance({ ...existing, ...updates });
  merged.validate();

  return instanceRepository.update(id, updates);
}

module.exports = updateInstance;
