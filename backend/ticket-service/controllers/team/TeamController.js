'use strict';

const createTeam = require('../../use-cases/team/createTeam');
const getTeamById = require('../../use-cases/team/getTeamById');
const getAllTeams = require('../../use-cases/team/getAllTeams');
const updateTeam = require('../../use-cases/team/updateTeam');
const deleteTeam = require('../../use-cases/team/deleteTeam');
const assignMember = require('../../use-cases/team/assignMember');
const removeMember = require('../../use-cases/team/removeMember');

class TeamController {
  async create(req, res) {
    try {
      const { title, description } = req.body;
      const team = await createTeam({ title, description });
      return res.status(201).json(team);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const team = await getTeamById(req.params.id, req.user);
      return res.status(200).json(team);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const teams = await getAllTeams(req.user);
      return res.status(200).json(teams);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { title, description } = req.body;
      const team = await updateTeam(req.params.id, { title, description });
      return res.status(200).json(team);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await deleteTeam(req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async assignMember(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const team = await assignMember(req.params.id, userId);
      return res.status(200).json(team);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async removeMember(req, res) {
    try {
      const result = await removeMember(req.params.id, req.params.userId);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }
}

module.exports = new TeamController();
