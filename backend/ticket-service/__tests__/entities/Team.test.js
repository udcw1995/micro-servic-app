'use strict';

const Team = require('../../entities/team/Team');

describe('Team entity', () => {
  const validData = { title: 'Backend Team', description: 'Handles API development' };

  test('constructs with all fields', () => {
    const now = new Date();
    const team = new Team({ ...validData, id: 'uuid-1', members: ['u1', 'u2'], createdAt: now, updatedAt: now });
    expect(team.id).toBe('uuid-1');
    expect(team.title).toBe('Backend Team');
    expect(team.description).toBe('Handles API development');
    expect(team.members).toEqual(['u1', 'u2']);
    expect(team.createdAt).toBe(now);
  });

  test('constructs with no arguments without throwing', () => {
    expect(() => new Team()).not.toThrow();
  });

  test('defaults members to empty array', () => {
    const team = new Team({ title: 'Team A' });
    expect(team.members).toEqual([]);
  });

  test('validate() passes for a valid team', () => {
    const team = new Team(validData);
    expect(() => team.validate()).not.toThrow();
  });

  test('validate() passes when description is absent', () => {
    const team = new Team({ title: 'Team A' });
    expect(() => team.validate()).not.toThrow();
  });

  test('validate() throws when title is empty string', () => {
    const team = new Team({ title: '' });
    expect(() => team.validate()).toThrow('Team title is required');
  });

  test('validate() throws when title is whitespace only', () => {
    const team = new Team({ title: '   ' });
    expect(() => team.validate()).toThrow('Team title is required');
  });

  test('validate() throws when title is undefined', () => {
    const team = new Team({ description: 'no title' });
    expect(() => team.validate()).toThrow('Team title is required');
  });
});
