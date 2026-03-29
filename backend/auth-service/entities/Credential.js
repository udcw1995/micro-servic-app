'use strict';

class Credential {
  constructor({ id, userId, email, passwordHash, createdAt, updatedAt } = {}) {
    this.id = id;
    this.userId = userId;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Credential;
