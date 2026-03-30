'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  delete: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const deleteTeam = require('../../use-cases/team/deleteTeam');

describe('deleteTeam use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns a success message when the team is deleted', async () => {
    teamRepository.delete.mockResolvedValue(true);

    const result = await deleteTeam('uuid-1');

    expect(teamRepository.delete).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual({ message: 'Team deleted successfully' });
  });

  test('throws 404 when team does not exist', async () => {
    teamRepository.delete.mockResolvedValue(false);

    await expect(deleteTeam('missing-id')).rejects.toMatchObject({
      message: 'Team not found',
      statusCode: 404,
    });
  });
});
