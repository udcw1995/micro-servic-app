'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CredentialModel = sequelize.define(
  'Credential',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'credentials',
    timestamps: true,
  }
);

module.exports = CredentialModel;
