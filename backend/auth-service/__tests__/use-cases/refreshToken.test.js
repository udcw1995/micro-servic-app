'use strict';

jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const refreshToken = require('../../use-cases/refreshToken');

describe('refreshToken use case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_REFRESH_SECRET = 'refresh_secret';
    process.env.JWT_ACCESS_SECRET = 'access_secret';
  });

  test('returns a new access token for a valid refresh token', async () => {
    jwt.verify.mockReturnValue({ userId: 'u1', email: 'alice@example.com' });
    jwt.sign.mockReturnValue('new_access_token');

    const result = await refreshToken({ token: 'valid_refresh_token' });

    expect(jwt.verify).toHaveBeenCalledWith('valid_refresh_token', 'refresh_secret');
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 'u1', email: 'alice@example.com' },
      'access_secret',
      expect.objectContaining({ expiresIn: expect.anything() })
    );
    expect(result).toEqual({ accessToken: 'new_access_token' });
  });

  test('throws 400 when token is not provided', async () => {
    await expect(refreshToken({ token: undefined })).rejects.toMatchObject({
      message: 'Refresh token is required',
      statusCode: 400,
    });
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test('throws 400 when token is an empty string', async () => {
    await expect(refreshToken({ token: '' })).rejects.toMatchObject({
      message: 'Refresh token is required',
      statusCode: 400,
    });
  });

  test('throws 401 when token has an invalid signature', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });

    await expect(refreshToken({ token: 'bad_token' })).rejects.toMatchObject({
      message: 'Invalid or expired refresh token',
      statusCode: 401,
    });
  });

  test('throws 401 when token is expired', async () => {
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => { throw expiredError; });

    await expect(refreshToken({ token: 'expired_token' })).rejects.toMatchObject({
      message: 'Invalid or expired refresh token',
      statusCode: 401,
    });
  });
});
