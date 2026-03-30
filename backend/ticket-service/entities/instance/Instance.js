'use strict';

class Instance {
  constructor({ id, teamId, name, url, appName, createdAt, updatedAt } = {}) {
    this.id = id;
    this.teamId = teamId;
    this.name = name;
    this.url = url;
    this.appName = appName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate() {
    if (!this.teamId) {
      throw new Error('teamId is required');
    }
    if (!this.name || this.name.trim() === '') {
      throw new Error('Instance name is required');
    }
    if (this.name.length > 50) {
      throw new Error('Instance name must not exceed 50 characters');
    }
    if (!this.url || this.url.trim() === '') {
      throw new Error('Instance url is required');
    }
    if (!this.appName || this.appName.trim() === '') {
      throw new Error('appName is required');
    }
    if (this.appName.length > 30) {
      throw new Error('appName must not exceed 30 characters');
    }
  }
}

module.exports = Instance;
