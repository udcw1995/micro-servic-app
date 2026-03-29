'use strict';

jest.mock('../../repositories/role/RoleRepository', () => ({
  delete: jest.fn(),
}));

const roleRepository = require('../../repositories/role/RoleRepository');
const deleteRole = require('../../use-cases/role/deleteRole');

describe('deleteRole use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns a success message when the role is deleted', async () => {
    roleRepository.delete.mockResolvedValue(true);

    const result = await deleteRole('uuid-1');
    expect(result).toEqual({ message: 'Role deleted successfully' });
    expect(roleRepository.delete).toHaveBeenCalledWith('uuid-1');
  });

  test('throws 404 when role is not found', async () => {
    roleRepository.delete.mockResolvedValue(false);

    await expect(deleteRole('not-exist')).rejects.toMatchObject({
      message: 'Role not found',
      statusCode: 404,
    });
  });
});
