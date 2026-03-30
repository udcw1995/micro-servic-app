'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  findAll: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const getAllTeams = require('../../use-cases/team/getAllTeams');

describe('getAllTeams use case', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns a list of all teams', async () => {
    const teams = [
      { id: 'uuid-1', title: 'Team A', members: [] },
      { id: 'uuid-2', title: 'Team B', members: ['u1'] },
    ];
    teamRepository.findAll.mockResolvedValue(teams);

    const result = await getAllTeams();

    expect(teamRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(teams);
  });

  test('returns an empty array when there are no teams', async () => {
    teamRepository.findAll.mockResolvedValue([]);

    const result = await getAllTeams();

    expect(result).toEqual([]);
  });
});
