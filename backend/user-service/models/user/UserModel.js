'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserModel = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      validate: {
        isEmail: true,
      },
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = UserModel;
