'use strict';

const UserModel = require('../models/user/UserModel');
const RoleModel = require('../models/role/RoleModel');

/**
 * Verifies that the authenticated user has the 'admin' role.
 * Runs after the `authenticate` middleware (req.user.userId must be set).
 *
 * NOTE: performs a DB lookup on every request. To avoid this overhead in the
 * future, embed the role name in the JWT payload when issuing tokens.
 */
async function requireAdmin(req, res, next) {
  try {
    const user = await UserModel.findByPk(req.user.userId, {
      include: [{ model: RoleModel, as: 'role', attributes: ['name'] }],
    });

    if (!user || !user.role || user.role.name !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
  } catch {
    return res.status(500).json({ error: 'Failed to verify admin privileges' });
  }
}

module.exports = requireAdmin;
