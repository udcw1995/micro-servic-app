'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoleModel = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    privileges: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
  }
);

module.exports = RoleModel;
