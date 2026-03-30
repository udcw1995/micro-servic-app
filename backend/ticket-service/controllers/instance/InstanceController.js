'use strict';

const createInstance = require('../../use-cases/instance/createInstance');
const getInstanceById = require('../../use-cases/instance/getInstanceById');
const getAllInstancesByTeam = require('../../use-cases/instance/getAllInstancesByTeam');
const updateInstance = require('../../use-cases/instance/updateInstance');
const deleteInstance = require('../../use-cases/instance/deleteInstance');

class InstanceController {
  async create(req, res) {
    try {
      const { teamId, name, url, appName } = req.body;
      const instance = await createInstance({ teamId, name, url, appName });
      return res.status(201).json(instance);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const instance = await getInstanceById(req.params.id, req.user);
      return res.status(200).json(instance);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async getAllByTeam(req, res) {
    try {
      const instances = await getAllInstancesByTeam(req.params.teamId, req.user);
      return res.status(200).json(instances);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { name, url, appName } = req.body;
      const instance = await updateInstance(req.params.id, { name, url, appName });
      return res.status(200).json(instance);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await deleteInstance(req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
}

module.exports = new InstanceController();
