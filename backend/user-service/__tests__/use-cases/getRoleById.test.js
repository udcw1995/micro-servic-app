'use strict';

jest.mock('../../repositories/role/RoleRepository', () => ({
  findById: jest.fn(),
}));

const roleRepository = require('../../repositories/role/RoleRepository');
const getRoleById = require('../../use-cases/role/getRoleById');

describe('getRoleById use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the role when found', async () => {
    const role = { id: 'uuid-1', name: 'admin', privileges: {} };
    roleRepository.findById.mockResolvedValue(role);

    const result = await getRoleById('uuid-1');
    expect(result).toEqual(role);
    expect(roleRepository.findById).toHaveBeenCalledWith('uuid-1');
  });

  test('throws 404 when role is not found', async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(getRoleById('not-exist')).rejects.toMatchObject({
      message: 'Role not found',
      statusCode: 404,
    });
  });
});
