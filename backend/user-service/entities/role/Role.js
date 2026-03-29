'use strict';

class Role {
  constructor({ id, name, privileges, createdAt, updatedAt } = {}) {
    this.id = id;
    this.name = name;
    this.privileges = privileges || {};
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate() {
    if (!this.name || this.name.trim() === '') {
      throw new Error('Role name is required');
    }
    if (this.privileges !== null && typeof this.privileges !== 'object') {
      throw new Error('Privileges must be a JSON object');
    }
  }
}

module.exports = Role;
