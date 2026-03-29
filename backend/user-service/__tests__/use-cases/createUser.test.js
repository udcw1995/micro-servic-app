'use strict';

jest.mock('../../repositories/user/UserRepository', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const userRepository = require('../../repositories/user/UserRepository');
const createUser = require('../../use-cases/user/createUser');

describe('createUser use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const validPayload = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };

  test('creates and returns a user when the email is not taken', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    const created = { id: 'uuid-1', ...validPayload };
    userRepository.create.mockResolvedValue(created);

    const result = await createUser(validPayload);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(validPayload.email);
    expect(userRepository.create).toHaveBeenCalledWith(validPayload);
    expect(result).toEqual(created);
  });

  test('throws 409 when email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing', ...validPayload });

    await expect(createUser(validPayload)).rejects.toMatchObject({
      message: 'A user with this email already exists',
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  test('throws a validation error when email is invalid', async () => {
    await expect(createUser({ ...validPayload, email: 'bad-email' })).rejects.toThrow(
      'A valid email address is required'
    );
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  test('throws a validation error when firstName is empty', async () => {
    await expect(createUser({ ...validPayload, firstName: '' })).rejects.toThrow(
      'First name is required'
    );
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  test('throws a validation error when lastName is missing', async () => {
    await expect(createUser({ ...validPayload, lastName: '' })).rejects.toThrow(
      'Last name is required'
    );
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });
});
