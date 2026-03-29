'use strict';

const User = require('../../entities/user/User');

describe('User entity', () => {
  const validData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

  test('constructs with all fields', () => {
    const now = new Date();
    const user = new User({ ...validData, id: 'uuid-123', createdAt: now, updatedAt: now });
    expect(user.id).toBe('uuid-123');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.createdAt).toBe(now);
  });

  test('constructs with no arguments without throwing', () => {
    expect(() => new User()).not.toThrow();
  });

  test('validate() passes for valid data', () => {
    const user = new User(validData);
    expect(() => user.validate()).not.toThrow();
  });

  test('validate() throws when firstName is empty string', () => {
    const user = new User({ ...validData, firstName: '' });
    expect(() => user.validate()).toThrow('First name is required');
  });

  test('validate() throws when firstName is whitespace only', () => {
    const user = new User({ ...validData, firstName: '   ' });
    expect(() => user.validate()).toThrow('First name is required');
  });

  test('validate() throws when firstName is undefined', () => {
    const user = new User({ ...validData, firstName: undefined });
    expect(() => user.validate()).toThrow('First name is required');
  });

  test('validate() throws when lastName is empty string', () => {
    const user = new User({ ...validData, lastName: '' });
    expect(() => user.validate()).toThrow('Last name is required');
  });

  test('validate() throws when email is missing', () => {
    const user = new User({ ...validData, email: '' });
    expect(() => user.validate()).toThrow('A valid email address is required');
  });

  test('validate() throws when email has no @', () => {
    const user = new User({ ...validData, email: 'notanemail' });
    expect(() => user.validate()).toThrow('A valid email address is required');
  });

  test('validate() throws when email has no domain', () => {
    const user = new User({ ...validData, email: 'user@' });
    expect(() => user.validate()).toThrow('A valid email address is required');
  });
});
