'use strict';

jest.mock('../../repositories/role/RoleRepository', () => ({
  findAll: jest.fn(),
}));

const roleRepository = require('../../repositories/role/RoleRepository');
const getAllRoles = require('../../use-cases/role/getAllRoles');

describe('getAllRoles use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns all roles', async () => {
    const roles = [
      { id: 'uuid-1', name: 'admin', privileges: {} },
      { id: 'uuid-2', name: 'user', privileges: {} },
    ];
    roleRepository.findAll.mockResolvedValue(roles);

    const result = await getAllRoles();
    expect(result).toEqual(roles);
    expect(roleRepository.findAll).toHaveBeenCalledTimes(1);
  });

  test('returns an empty array when no roles exist', async () => {
    roleRepository.findAll.mockResolvedValue([]);
    const result = await getAllRoles();
    expect(result).toEqual([]);
  });
});
