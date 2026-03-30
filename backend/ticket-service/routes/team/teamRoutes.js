'use strict';

const { Router } = require('express');
const teamController = require('../../controllers/team/TeamController');
const authenticate = require('../../middleware/authenticate');
const requireAdmin = require('../../middleware/requireAdmin');

const router = Router();

// All team management requires a valid JWT and admin privileges
router.use(authenticate, requireAdmin);

router.post('/', (req, res) => teamController.create(req, res));
router.get('/', (req, res) => teamController.getAll(req, res));
router.get('/:id', (req, res) => teamController.getById(req, res));
router.put('/:id', (req, res) => teamController.update(req, res));
router.delete('/:id', (req, res) => teamController.delete(req, res));

// Member assignment
router.post('/:id/members', (req, res) => teamController.assignMember(req, res));
router.delete('/:id/members/:userId', (req, res) => teamController.removeMember(req, res));

module.exports = router;
