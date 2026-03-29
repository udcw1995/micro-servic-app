'use strict';

jest.mock('../../services/UserRepository', () => ({
  delete: jest.fn(),
}));

const userRepository = require('../../repositories/user/UserRepository');
const deleteUser = require('../../use-cases/user/deleteUser');

describe('deleteUser use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns a success message when the user is deleted', async () => {
    userRepository.delete.mockResolvedValue(true);

    const result = await deleteUser('uuid-1');

    expect(userRepository.delete).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  test('throws 404 when the user does not exist', async () => {
    userRepository.delete.mockResolvedValue(false);

    await expect(deleteUser('missing-id')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
  });
});
