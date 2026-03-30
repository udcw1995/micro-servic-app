'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TeamModel = sequelize.define(
  'Team',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'teams',
    timestamps: true,
  }
);

module.exports = TeamModel;
