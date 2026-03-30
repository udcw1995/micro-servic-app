'use strict';

jest.mock('../../repositories/team/TeamRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  hasMember: jest.fn(),
}));

const teamRepository = require('../../repositories/team/TeamRepository');
const createTeam = require('../../use-cases/team/createTeam');

describe('createTeam use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const validPayload = { title: 'Backend Team', description: 'Handles API development' };

  test('creates and returns a team for valid input', async () => {
    const created = { id: 'uuid-1', ...validPayload, members: [] };
    teamRepository.create.mockResolvedValue(created);

    const result = await createTeam(validPayload);

    expect(teamRepository.create).toHaveBeenCalledWith(validPayload);
    expect(result).toEqual(created);
  });

  test('creates a team without description', async () => {
    const created = { id: 'uuid-1', title: 'Team A', description: null, members: [] };
    teamRepository.create.mockResolvedValue(created);

    const result = await createTeam({ title: 'Team A' });

    expect(teamRepository.create).toHaveBeenCalledWith({ title: 'Team A', description: undefined });
    expect(result).toEqual(created);
  });

  test('throws a validation error when title is empty', async () => {
    await expect(createTeam({ title: '' })).rejects.toThrow('Team title is required');
    expect(teamRepository.create).not.toHaveBeenCalled();
  });

  test('throws a validation error when title is whitespace only', async () => {
    await expect(createTeam({ title: '   ' })).rejects.toThrow('Team title is required');
    expect(teamRepository.create).not.toHaveBeenCalled();
  });

  test('throws a validation error when title is missing', async () => {
    await expect(createTeam({})).rejects.toThrow('Team title is required');
    expect(teamRepository.create).not.toHaveBeenCalled();
  });
});
