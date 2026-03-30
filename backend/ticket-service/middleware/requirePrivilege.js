'use strict';

/**
 * Middleware factory that checks whether the authenticated user's JWT
 * contains a specific privilege key set to true.
 *
 * Privileges are embedded in the access token at login time by the
 * auth-service (sourced from user-service role privileges), so no
 * additional database lookup is required.
 *
 * Usage:  router.post('/', authenticate, requirePrivilege('canManageTeams'), handler)
 */
function requirePrivilege(key) {
  return function (req, res, next) {
    const privileges = req.user?.privileges;
    if (!privileges || !privileges[key]) {
      return res.status(403).json({ error: `Missing required privilege: ${key}` });
    }
    next();
  };
}

module.exports = requirePrivilege;
