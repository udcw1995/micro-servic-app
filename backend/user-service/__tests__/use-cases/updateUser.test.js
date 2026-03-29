'use strict';

jest.mock('../../services/UserRepository', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
}));

const userRepository = require('../../services/UserRepository');
const updateUser = require('../../use-cases/updateUser');

describe('updateUser use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const existing = {
    id: 'uuid-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  test('updates firstName and returns the updated user', async () => {
    userRepository.findById.mockResolvedValue(existing);
    const updated = { ...existing, firstName: 'Johnny' };
    userRepository.update.mockResolvedValue(updated);

    const result = await updateUser('uuid-1', { firstName: 'Johnny' });

    expect(userRepository.update).toHaveBeenCalledWith('uuid-1', { firstName: 'Johnny' });
    expect(result).toEqual(updated);
  });

  test('throws 404 when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(updateUser('missing', { firstName: 'X' })).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  test('throws 409 when the new email is taken by another user', async () => {
    userRepository.findById.mockResolvedValue(existing);
    userRepository.findByEmail.mockResolvedValue({ id: 'other-id', email: 'taken@example.com' });

    await expect(updateUser('uuid-1', { email: 'taken@example.com' })).rejects.toMatchObject({
      message: 'A user with this email already exists',
      statusCode: 409,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  test('does not check email uniqueness when email is unchanged', async () => {
    userRepository.findById.mockResolvedValue(existing);
    userRepository.update.mockResolvedValue(existing);

    await updateUser('uuid-1', { email: 'john@example.com' });

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  test('throws a validation error when setting firstName to empty', async () => {
    userRepository.findById.mockResolvedValue(existing);

    await expect(updateUser('uuid-1', { firstName: '' })).rejects.toThrow('First name is required');
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  test('throws a validation error when setting email to invalid format', async () => {
    userRepository.findById.mockResolvedValue(existing);

    await expect(updateUser('uuid-1', { email: 'not-valid' })).rejects.toThrow(
      'A valid email address is required'
    );
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
