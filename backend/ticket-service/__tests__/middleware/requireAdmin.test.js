'use strict';

const requireAdmin = require('../../middleware/requireAdmin');

describe('requireAdmin middleware', () => {
  function makeReqRes(roleName) {
    const req = { user: { userId: 'u1', roleName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { req, res, next };
  }

  test('calls next() when req.user.roleName is admin', () => {
    const { req, res, next } = makeReqRes('admin');
    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 403 when roleName is a non-admin value', () => {
    const { req, res, next } = makeReqRes('developer');
    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin privileges required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when roleName is null', () => {
    const { req, res, next } = makeReqRes(null);
    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin privileges required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when req.user is absent', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

