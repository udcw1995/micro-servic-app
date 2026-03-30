'use strict';

class Team {
  constructor({ id, title, description, members, createdAt, updatedAt } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.members = members || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate() {
    if (!this.title || this.title.trim() === '') {
      throw new Error('Team title is required');
    }
  }
}

module.exports = Team;
