'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  findById: jest.fn(),
  update: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const updateTeam = require('../../use-cases/team/updateTeam');

describe('updateTeam use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const existing = { id: 'uuid-1', title: 'Backend Team', description: 'Old desc', members: [] };

  test('updates title and returns the updated team', async () => {
    teamRepository.findById.mockResolvedValue(existing);
    const updated = { ...existing, title: 'New Title' };
    teamRepository.update.mockResolvedValue(updated);

    const result = await updateTeam('uuid-1', { title: 'New Title' });

    expect(teamRepository.update).toHaveBeenCalledWith('uuid-1', { title: 'New Title' });
    expect(result).toEqual(updated);
  });

  test('updates description and returns the updated team', async () => {
    teamRepository.findById.mockResolvedValue(existing);
    const updated = { ...existing, description: 'New desc' };
    teamRepository.update.mockResolvedValue(updated);

    const result = await updateTeam('uuid-1', { description: 'New desc' });

    expect(teamRepository.update).toHaveBeenCalledWith('uuid-1', { description: 'New desc' });
    expect(result).toEqual(updated);
  });

  test('throws 404 when team does not exist', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(updateTeam('missing', { title: 'X' })).rejects.toMatchObject({
      message: 'Team not found',
      statusCode: 404,
    });
    expect(teamRepository.update).not.toHaveBeenCalled();
  });

  test('throws a validation error when setting title to empty string', async () => {
    teamRepository.findById.mockResolvedValue(existing);

    await expect(updateTeam('uuid-1', { title: '' })).rejects.toThrow('Team title is required');
    expect(teamRepository.update).not.toHaveBeenCalled();
  });

  test('throws a validation error when setting title to whitespace', async () => {
    teamRepository.findById.mockResolvedValue(existing);

    await expect(updateTeam('uuid-1', { title: '   ' })).rejects.toThrow('Team title is required');
    expect(teamRepository.update).not.toHaveBeenCalled();
  });

  test('does not include undefined fields in the update payload', async () => {
    teamRepository.findById.mockResolvedValue(existing);
    teamRepository.update.mockResolvedValue(existing);

    await updateTeam('uuid-1', { title: 'Updated', description: undefined });

    expect(teamRepository.update).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
  });
});
