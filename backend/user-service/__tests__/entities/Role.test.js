'use strict';

const Role = require('../../entities/role/Role');

describe('Role entity', () => {
  test('constructs with all fields', () => {
    const role = new Role({ id: 'uuid-1', name: 'admin', privileges: { canCreateUser: true } });
    expect(role.id).toBe('uuid-1');
    expect(role.name).toBe('admin');
    expect(role.privileges).toEqual({ canCreateUser: true });
  });

  test('defaults privileges to empty object', () => {
    const role = new Role({ name: 'user' });
    expect(role.privileges).toEqual({});
  });

  test('validate() passes with a valid role', () => {
    const role = new Role({ name: 'developer', privileges: {} });
    expect(() => role.validate()).not.toThrow();
  });

  test('validate() throws when name is missing', () => {
    const role = new Role({ privileges: {} });
    expect(() => role.validate()).toThrow('Role name is required');
  });

  test('validate() throws when name is empty string', () => {
    const role = new Role({ name: '', privileges: {} });
    expect(() => role.validate()).toThrow('Role name is required');
  });

  test('validate() throws when name is whitespace only', () => {
    const role = new Role({ name: '   ', privileges: {} });
    expect(() => role.validate()).toThrow('Role name is required');
  });

  test('validate() throws when privileges is not an object', () => {
    const role = new Role({ name: 'admin' });
    role.privileges = 'not-an-object';
    expect(() => role.validate()).toThrow('Privileges must be a JSON object');
  });
});
