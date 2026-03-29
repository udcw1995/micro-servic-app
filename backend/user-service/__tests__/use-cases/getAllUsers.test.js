'use strict';

jest.mock('../../services/UserRepository', () => ({
  findAll: jest.fn(),
}));

const userRepository = require('../../services/UserRepository');
const getAllUsers = require('../../use-cases/getAllUsers');

describe('getAllUsers use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns a list of all users', async () => {
    const users = [
      { id: '1', firstName: 'Alice', lastName: 'A', email: 'alice@example.com' },
      { id: '2', firstName: 'Bob', lastName: 'B', email: 'bob@example.com' },
    ];
    userRepository.findAll.mockResolvedValue(users);

    const result = await getAllUsers();

    expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  test('returns an empty array when there are no users', async () => {
    userRepository.findAll.mockResolvedValue([]);

    const result = await getAllUsers();

    expect(result).toEqual([]);
  });
});
