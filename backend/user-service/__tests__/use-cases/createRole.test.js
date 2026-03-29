'use strict';

jest.mock('../../repositories/role/RoleRepository', () => ({
  create: jest.fn(),
  findByName: jest.fn(),
}));

const roleRepository = require('../../repositories/role/RoleRepository');
const createRole = require('../../use-cases/role/createRole');

describe('createRole use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates and returns a new role', async () => {
    roleRepository.findByName.mockResolvedValue(null);
    roleRepository.create.mockResolvedValue({ id: 'uuid-1', name: 'editor', privileges: {} });

    const result = await createRole({ name: 'editor', privileges: {} });

    expect(roleRepository.findByName).toHaveBeenCalledWith('editor');
    expect(roleRepository.create).toHaveBeenCalledWith({ name: 'editor', privileges: {} });
    expect(result.name).toBe('editor');
  });

  test('defaults privileges to empty object when not provided', async () => {
    roleRepository.findByName.mockResolvedValue(null);
    roleRepository.create.mockResolvedValue({ id: 'uuid-1', name: 'viewer', privileges: {} });

    await createRole({ name: 'viewer' });

    expect(roleRepository.create).toHaveBeenCalledWith({ name: 'viewer', privileges: {} });
  });

  test('throws 409 when a role with the same name already exists', async () => {
    roleRepository.findByName.mockResolvedValue({ id: 'uuid-1', name: 'admin' });

    await expect(createRole({ name: 'admin' })).rejects.toMatchObject({
      message: 'A role with this name already exists',
      statusCode: 409,
    });
    expect(roleRepository.create).not.toHaveBeenCalled();
  });

  test('throws when name is missing', async () => {
    await expect(createRole({ privileges: {} })).rejects.toThrow('Role name is required');
    expect(roleRepository.create).not.toHaveBeenCalled();
  });
});
