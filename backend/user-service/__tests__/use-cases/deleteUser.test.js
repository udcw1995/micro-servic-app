'use strict';

jest.mock('../../repositories/user/UserRepository', () => ({
  delete: jest.fn(),
}));

jest.mock('../../services/AuthServiceClient', () => ({
  notifyUserDeleted: jest.fn().mockResolvedValue(undefined),
}));

const userRepository = require('../../repositories/user/UserRepository');
const AuthServiceClient = require('../../services/AuthServiceClient');
const deleteUser = require('../../use-cases/user/deleteUser');

describe('deleteUser use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns a success message and notifies auth-service when the user is deleted', async () => {
    userRepository.delete.mockResolvedValue(true);

    const result = await deleteUser('uuid-1');

    expect(userRepository.delete).toHaveBeenCalledWith('uuid-1');
    expect(AuthServiceClient.notifyUserDeleted).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  test('throws 404 when the user does not exist', async () => {
    userRepository.delete.mockResolvedValue(false);

    await expect(deleteUser('missing-id')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
    expect(AuthServiceClient.notifyUserDeleted).not.toHaveBeenCalled();
  });

  test('still returns success when auth-service notification fails', async () => {
    userRepository.delete.mockResolvedValue(true);
    AuthServiceClient.notifyUserDeleted.mockRejectedValue(new Error('RabbitMQ down'));

    const result = await deleteUser('uuid-1');

    expect(result).toEqual({ message: 'User deleted successfully' });
  });
});
