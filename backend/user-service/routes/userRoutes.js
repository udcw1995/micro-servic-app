'use strict';

const { Router } = require('express');
const userController = require('../controllers/UserController');
const authenticate = require('../middleware/authenticate');

const router = Router();

// Public
router.post('/', (req, res) => userController.create(req, res));

// Protected — requires a valid JWT access token
router.get('/', authenticate, (req, res) => userController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => userController.getById(req, res));
router.put('/:id', authenticate, (req, res) => userController.update(req, res));
router.delete('/:id', authenticate, (req, res) => userController.delete(req, res));

module.exports = router;
