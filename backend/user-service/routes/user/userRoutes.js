'use strict';

const { Router } = require('express');
const userController = require('../../controllers/user/UserController');
const authenticate = require('../../middleware/authenticate');
const requireAdmin = require('../../middleware/requireAdmin');

const router = Router();

// Admin only — create user via HTTP (registration goes through auth-service → RabbitMQ)
router.post('/', authenticate, requireAdmin, (req, res) => userController.create(req, res));

// Protected — requires a valid JWT access token
router.get('/', authenticate, (req, res) => userController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => userController.getById(req, res));
router.put('/:id', authenticate, (req, res) => userController.update(req, res));
router.delete('/:id', authenticate, (req, res) => userController.delete(req, res));

module.exports = router;
