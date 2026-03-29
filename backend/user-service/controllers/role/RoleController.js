'use strict';

const createRole = require('../../use-cases/role/createRole');
const getRoleById = require('../../use-cases/role/getRoleById');
const getAllRoles = require('../../use-cases/role/getAllRoles');
const updateRole = require('../../use-cases/role/updateRole');
const deleteRole = require('../../use-cases/role/deleteRole');

class RoleController {
  async create(req, res) {
    try {
      const { name, privileges } = req.body;
      const role = await createRole({ name, privileges });
      return res.status(201).json(role);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const role = await getRoleById(req.params.id);
      return res.status(200).json(role);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const roles = await getAllRoles();
      return res.status(200).json(roles);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { name, privileges } = req.body;
      const role = await updateRole(req.params.id, { name, privileges });
      return res.status(200).json(role);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await deleteRole(req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
}

module.exports = new RoleController();
