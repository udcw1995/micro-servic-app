'use strict';

jest.mock('../../services/UserRepository', () => ({
  findById: jest.fn(),
}));

const userRepository = require('../../services/UserRepository');
const getUserById = require('../../use-cases/getUserById');

describe('getUserById use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the user when found', async () => {
    const user = { id: 'uuid-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };
    userRepository.findById.mockResolvedValue(user);

    const result = await getUserById('uuid-1');

    expect(userRepository.findById).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual(user);
  });

  test('throws 404 when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(getUserById('missing-id')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
  });
});
