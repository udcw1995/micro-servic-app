'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * Local read-model of users synced from user-service via RabbitMQ events.
 * This avoids cross-service HTTP calls for every request.
 */
const UserModel = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = UserModel;
