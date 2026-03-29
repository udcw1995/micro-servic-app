'use strict';

const createUser = require('../../use-cases/user/createUser');
const getUserById = require('../../use-cases/user/getUserById');
const getAllUsers = require('../../use-cases/user/getAllUsers');
const updateUser = require('../../use-cases/user/updateUser');
const deleteUser = require('../../use-cases/user/deleteUser');

class UserController {
  async create(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const user = await createUser({ firstName, lastName, email });
      return res.status(201).json(user);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await getUserById(req.params.id);
      return res.status(200).json(user);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await getAllUsers();
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const user = await updateUser(req.params.id, { firstName, lastName, email });
      return res.status(200).json(user);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await deleteUser(req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
}

module.exports = new UserController();
