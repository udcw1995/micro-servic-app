'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  findById: jest.fn(),
  removeMember: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const removeMember = require('../../use-cases/team/removeMember');

describe('removeMember use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const team = { id: 'team-1', title: 'Backend Team', members: ['user-1'] };

  test('removes a member and returns a success message', async () => {
    teamRepository.findById.mockResolvedValue(team);
    teamRepository.removeMember.mockResolvedValue(true);

    const result = await removeMember('team-1', 'user-1');

    expect(teamRepository.findById).toHaveBeenCalledWith('team-1');
    expect(teamRepository.removeMember).toHaveBeenCalledWith('team-1', 'user-1');
    expect(result).toEqual({ message: 'Member removed from team successfully' });
  });

  test('throws 404 when team does not exist', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(removeMember('missing-team', 'user-1')).rejects.toMatchObject({
      message: 'Team not found',
      statusCode: 404,
    });
    expect(teamRepository.removeMember).not.toHaveBeenCalled();
  });

  test('throws 404 when user is not a member of the team', async () => {
    teamRepository.findById.mockResolvedValue(team);
    teamRepository.removeMember.mockResolvedValue(false);

    await expect(removeMember('team-1', 'not-a-member')).rejects.toMatchObject({
      message: 'User is not a member of this team',
      statusCode: 404,
    });
  });
});
