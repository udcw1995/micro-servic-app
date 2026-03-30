'use strict';

/**
 * Verifies that the authenticated user has the 'admin' role.
 * The role is read directly from the JWT payload (set at login time by auth-service),
 * so no database lookup is required and this works even before the local
 * read-model is fully synced.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.roleName !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

module.exports = requireAdmin;
