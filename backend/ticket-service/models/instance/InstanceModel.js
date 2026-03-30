'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const InstanceModel = sequelize.define(
  'Instance',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appName: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
  },
  {
    tableName: 'instances',
    timestamps: true,
  }
);

module.exports = InstanceModel;
