'use strict';

jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const authenticate = require('../../middleware/authenticate');

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'test_secret';
  });

  function makeReqRes(headers = {}) {
    const req = { headers };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { req, res, next };
  }

  test('calls next() and attaches decoded user for a valid token', () => {
    const decoded = { userId: 'u1', email: 'test@example.com' };
    jwt.verify.mockReturnValue(decoded);

    const { req, res, next } = makeReqRes({ authorization: 'Bearer valid.token.here' });
    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', 'test_secret');
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header is absent', () => {
    const { req, res, next } = makeReqRes({});
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing or malformed Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header does not start with Bearer', () => {
    const { req, res, next } = makeReqRes({ authorization: 'Basic abc123' });
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing or malformed Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when the token fails verification', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const { req, res, next } = makeReqRes({ authorization: 'Bearer bad.token' });
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired access token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for an expired token', () => {
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => { throw expiredError; });

    const { req, res, next } = makeReqRes({ authorization: 'Bearer expired.token' });
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
