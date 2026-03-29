'use strict';

const { Router } = require('express');
const roleController = require('../../controllers/role/RoleController');
const authenticate = require('../../middleware/authenticate');
const requireAdmin = require('../../middleware/requireAdmin');

const router = Router();

// All role management requires a valid JWT and admin privileges
router.use(authenticate, requireAdmin);

router.post('/', (req, res) => roleController.create(req, res));
router.get('/', (req, res) => roleController.getAll(req, res));
router.get('/:id', (req, res) => roleController.getById(req, res));
router.put('/:id', (req, res) => roleController.update(req, res));
router.delete('/:id', (req, res) => roleController.delete(req, res));

module.exports = router;
