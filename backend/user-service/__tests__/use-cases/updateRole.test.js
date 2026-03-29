'use strict';

jest.mock('../../repositories/role/RoleRepository', () => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  update: jest.fn(),
}));

const roleRepository = require('../../repositories/role/RoleRepository');
const updateRole = require('../../use-cases/role/updateRole');

describe('updateRole use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const existing = { id: 'uuid-1', name: 'editor', privileges: { canEditAnyUser: false } };

  test('updates role name successfully', async () => {
    roleRepository.findById.mockResolvedValue(existing);
    roleRepository.findByName.mockResolvedValue(null);
    roleRepository.update.mockResolvedValue({ ...existing, name: 'content-editor' });

    const result = await updateRole('uuid-1', { name: 'content-editor' });
    expect(result.name).toBe('content-editor');
    expect(roleRepository.update).toHaveBeenCalledWith('uuid-1', { name: 'content-editor' });
  });

  test('updates privileges successfully', async () => {
    roleRepository.findById.mockResolvedValue(existing);
    const newPriv = { canEditAnyUser: true };
    roleRepository.update.mockResolvedValue({ ...existing, privileges: newPriv });

    await updateRole('uuid-1', { privileges: newPriv });
    expect(roleRepository.update).toHaveBeenCalledWith('uuid-1', { privileges: newPriv });
  });

  test('throws 404 when role does not exist', async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(updateRole('not-exist', { name: 'x' })).rejects.toMatchObject({
      message: 'Role not found',
      statusCode: 404,
    });
  });

  test('throws 409 when new name is taken by another role', async () => {
    roleRepository.findById.mockResolvedValue(existing);
    roleRepository.findByName.mockResolvedValue({ id: 'uuid-2', name: 'admin' });

    await expect(updateRole('uuid-1', { name: 'admin' })).rejects.toMatchObject({
      message: 'A role with this name already exists',
      statusCode: 409,
    });
    expect(roleRepository.update).not.toHaveBeenCalled();
  });

  test('same-name update skips duplicate check', async () => {
    roleRepository.findById.mockResolvedValue(existing);
    roleRepository.update.mockResolvedValue(existing);

    await updateRole('uuid-1', { name: 'editor' });
    expect(roleRepository.findByName).not.toHaveBeenCalled();
    expect(roleRepository.update).toHaveBeenCalledWith('uuid-1', { name: 'editor' });
  });

  test('throws when name is set to empty string', async () => {
    roleRepository.findById.mockResolvedValue(existing);

    await expect(updateRole('uuid-1', { name: '' })).rejects.toThrow('Role name is required');
    expect(roleRepository.update).not.toHaveBeenCalled();
  });
});
