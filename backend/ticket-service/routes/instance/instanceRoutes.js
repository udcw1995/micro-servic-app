'use strict';

const { Router } = require('express');
const instanceController = require('../../controllers/instance/InstanceController');
const authenticate = require('../../middleware/authenticate');
const requirePrivilege = require('../../middleware/requirePrivilege');

const router = Router();
const canManageInstances = requirePrivilege('canManageInstances');

// View routes — any authenticated user (membership check in use-cases)
router.get('/team/:teamId', authenticate, (req, res) => instanceController.getAllByTeam(req, res));
router.get('/:id', authenticate, (req, res) => instanceController.getById(req, res));

// Mutating routes — requires canManageInstances privilege
router.post('/', authenticate, canManageInstances, (req, res) => instanceController.create(req, res));
router.put('/:id', authenticate, canManageInstances, (req, res) => instanceController.update(req, res));
router.delete('/:id', authenticate, canManageInstances, (req, res) => instanceController.delete(req, res));

module.exports = router;
