'use strict';

class User {
  constructor({ id, firstName, lastName, email, roleId, role, createdAt, updatedAt } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.roleId = roleId;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate() {
    if (!this.firstName || this.firstName.trim() === '') {
      throw new Error('First name is required');
    }
    if (!this.lastName || this.lastName.trim() === '') {
      throw new Error('Last name is required');
    }
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      throw new Error('A valid email address is required');
    }
  }
}

module.exports = User;
