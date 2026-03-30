'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  findById: jest.fn(),
  hasMember: jest.fn(),
  addMember: jest.fn(),
}));

jest.mock('../../repositories/user/UserRepository', () => ({
  findById: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const userRepository = require('../../repositories/user/UserRepository');
const assignMember = require('../../use-cases/team/assignMember');

describe('assignMember use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const team = { id: 'team-1', title: 'Backend Team', members: [] };
  const user = { id: 'user-1', firstName: 'Alice', lastName: 'Smith', roleName: 'developer' };

  test('assigns a user to a team and returns the updated team', async () => {
    teamRepository.findById.mockResolvedValue(team);
    userRepository.findById.mockResolvedValue(user);
    teamRepository.hasMember.mockResolvedValue(false);
    const updatedTeam = { ...team, members: ['user-1'] };
    teamRepository.addMember.mockResolvedValue(updatedTeam);

    const result = await assignMember('team-1', 'user-1');

    expect(teamRepository.findById).toHaveBeenCalledWith('team-1');
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    expect(teamRepository.hasMember).toHaveBeenCalledWith('team-1', 'user-1');
    expect(teamRepository.addMember).toHaveBeenCalledWith('team-1', 'user-1');
    expect(result).toEqual(updatedTeam);
  });

  test('throws 404 when team does not exist', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(assignMember('missing-team', 'user-1')).rejects.toMatchObject({
      message: 'Team not found',
      statusCode: 404,
    });
    expect(userRepository.findById).not.toHaveBeenCalled();
    expect(teamRepository.addMember).not.toHaveBeenCalled();
  });

  test('throws 404 when user does not exist in local read-model', async () => {
    teamRepository.findById.mockResolvedValue(team);
    userRepository.findById.mockResolvedValue(null);

    await expect(assignMember('team-1', 'missing-user')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
    expect(teamRepository.addMember).not.toHaveBeenCalled();
  });

  test('throws 409 when user is already a member of the team', async () => {
    teamRepository.findById.mockResolvedValue(team);
    userRepository.findById.mockResolvedValue(user);
    teamRepository.hasMember.mockResolvedValue(true);

    await expect(assignMember('team-1', 'user-1')).rejects.toMatchObject({
      message: 'User is already a member of this team',
      statusCode: 409,
    });
    expect(teamRepository.addMember).not.toHaveBeenCalled();
  });
});
