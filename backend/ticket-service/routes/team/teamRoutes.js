'use strict';

const { Router } = require('express');
const teamController = require('../../controllers/team/TeamController');
const authenticate = require('../../middleware/authenticate');
const requirePrivilege = require('../../middleware/requirePrivilege');

const router = Router();
const canManageTeams = requirePrivilege('canManageTeams');

// Read routes — any authenticated user (use-cases enforce membership for non-privileged users)
router.get('/', authenticate, (req, res) => teamController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => teamController.getById(req, res));

// Mutating routes — requires canManageTeams privilege
router.post('/', authenticate, canManageTeams, (req, res) => teamController.create(req, res));
router.put('/:id', authenticate, canManageTeams, (req, res) => teamController.update(req, res));
router.delete('/:id', authenticate, canManageTeams, (req, res) => teamController.delete(req, res));

// Member assignment — requires canManageTeams privilege
router.post('/:id/members', authenticate, canManageTeams, (req, res) => teamController.assignMember(req, res));
router.delete('/:id/members/:userId', authenticate, canManageTeams, (req, res) => teamController.removeMember(req, res));

module.exports = router;
