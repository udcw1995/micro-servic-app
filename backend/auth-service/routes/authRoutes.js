'use strict';

const { Router } = require('express');
const authController = require('../controllers/AuthController');

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

module.exports = router;
