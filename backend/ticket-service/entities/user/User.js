'use strict';

class User {
  constructor({ id, firstName, lastName, email, roleId, roleName, createdAt, updatedAt } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.roleId = roleId;
    this.roleName = roleName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = User;
