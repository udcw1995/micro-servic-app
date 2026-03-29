'use strict';

jest.mock('../../services/CredentialRepository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../services/UserServiceClient', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const credentialRepository = require('../../services/CredentialRepository');
const UserServiceClient = require('../../services/UserServiceClient');
const bcrypt = require('bcryptjs');
const register = require('../../use-cases/register');

describe('register use case', () => {
  beforeEach(() => jest.clearAllMocks());

  const valid = {
    firstName: 'Alice',
    lastName: 'Wonder',
    email: 'alice@example.com',
    password: 'StrongPass1',
  };

  const createdUser = {
    id: 'u1',
    firstName: 'Alice',
    lastName: 'Wonder',
    email: 'alice@example.com',
  };

  test('registers a new user and returns the profile', async () => {
    credentialRepository.findByEmail.mockResolvedValue(null);
    UserServiceClient.create.mockResolvedValue(createdUser);
    credentialRepository.create.mockResolvedValue({});

    const result = await register(valid);

    expect(credentialRepository.findByEmail).toHaveBeenCalledWith(valid.email);
    expect(UserServiceClient.create).toHaveBeenCalledWith({
      firstName: valid.firstName,
      lastName: valid.lastName,
      email: valid.email,
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(valid.password, 12);
    expect(credentialRepository.create).toHaveBeenCalledWith({
      userId: 'u1',
      email: valid.email,
      passwordHash: 'hashed_password',
    });
    expect(result).toEqual(createdUser);
  });

  test('throws 409 when the email is already registered', async () => {
    credentialRepository.findByEmail.mockResolvedValue({ id: 'existing' });

    await expect(register(valid)).rejects.toMatchObject({
      message: 'An account with this email already exists',
      statusCode: 409,
    });
    expect(UserServiceClient.create).not.toHaveBeenCalled();
  });

  test('throws 400 when firstName is missing', async () => {
    await expect(register({ ...valid, firstName: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('throws 400 when lastName is missing', async () => {
    await expect(register({ ...valid, lastName: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('throws 400 when email is invalid', async () => {
    await expect(register({ ...valid, email: 'not-an-email' })).rejects.toMatchObject({
      message: 'A valid email address is required',
      statusCode: 400,
    });
  });

  test('throws 400 when password is shorter than 8 characters', async () => {
    await expect(register({ ...valid, password: 'short' })).rejects.toMatchObject({
      message: 'Password must be at least 8 characters',
      statusCode: 400,
    });
  });

  test('throws 400 when password is missing', async () => {
    await expect(register({ ...valid, password: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
