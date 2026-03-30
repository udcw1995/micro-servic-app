'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  findById: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const getTeamById = require('../../use-cases/team/getTeamById');

describe('getTeamById use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the team when found', async () => {
    const team = { id: 'uuid-1', title: 'Backend Team', description: '', members: [] };
    teamRepository.findById.mockResolvedValue(team);

    const result = await getTeamById('uuid-1');

    expect(teamRepository.findById).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual(team);
  });

  test('throws 404 when team does not exist', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(getTeamById('missing-id')).rejects.toMatchObject({
      message: 'Team not found',
      statusCode: 404,
    });
  });
});
