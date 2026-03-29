'use strict';

jest.mock('../../services/CredentialRepository', () => ({
  findByEmail: jest.fn(),
}));

jest.mock('../../services/UserServiceClient', () => ({
  findById: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
}));

const credentialRepository = require('../../services/CredentialRepository');
const UserServiceClient = require('../../services/UserServiceClient');
const bcrypt = require('bcryptjs');
const login = require('../../use-cases/login');

describe('login use case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'access_secret';
    process.env.JWT_REFRESH_SECRET = 'refresh_secret';
  });

  const credential = {
    userId: 'u1',
    email: 'alice@example.com',
    passwordHash: 'hashed_password',
  };

  const user = {
    id: 'u1',
    firstName: 'Alice',
    lastName: 'Wonder',
    email: 'alice@example.com',
  };

  test('returns user profile and tokens on valid credentials', async () => {
    credentialRepository.findByEmail.mockResolvedValue(credential);
    bcrypt.compare.mockResolvedValue(true);
    UserServiceClient.findById.mockResolvedValue(user);

    const result = await login({ email: 'alice@example.com', password: 'StrongPass1' });

    expect(credentialRepository.findByEmail).toHaveBeenCalledWith('alice@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('StrongPass1', 'hashed_password');
    expect(UserServiceClient.findById).toHaveBeenCalledWith('u1');
    expect(result).toMatchObject({
      user: { id: 'u1', firstName: 'Alice', lastName: 'Wonder', email: 'alice@example.com' },
      accessToken: 'mock_token',
      refreshToken: 'mock_token',
    });
  });

  test('throws 401 when no credential found for email', async () => {
    credentialRepository.findByEmail.mockResolvedValue(null);

    await expect(login({ email: 'ghost@example.com', password: 'pass1234' })).rejects.toMatchObject({
      message: 'Invalid email or password',
      statusCode: 401,
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('throws 401 when password does not match', async () => {
    credentialRepository.findByEmail.mockResolvedValue(credential);
    bcrypt.compare.mockResolvedValue(false);

    await expect(login({ email: 'alice@example.com', password: 'WrongPass' })).rejects.toMatchObject({
      message: 'Invalid email or password',
      statusCode: 401,
    });
    expect(UserServiceClient.findById).not.toHaveBeenCalled();
  });

  test('throws 400 when email is missing', async () => {
    await expect(login({ email: '', password: 'pass1234' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('throws 400 when password is missing', async () => {
    await expect(login({ email: 'alice@example.com', password: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
