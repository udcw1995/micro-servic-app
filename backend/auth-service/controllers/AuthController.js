'use strict';

const register = require('../use-cases/register');
const login = require('../use-cases/login');
const refreshToken = require('../use-cases/refreshToken');

class AuthController {
  async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await register({ firstName, lastName, email, password });
      return res.status(201).json(user);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await login({ email, password });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async refresh(req, res) {
    try {
      const { token } = req.body;
      const result = await refreshToken({ token });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();
