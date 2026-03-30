'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * Join table for the many-to-many relationship between teams and users.
 * userId references a user in the user-service (no cross-service FK constraint).
 */
const TeamMemberModel = sequelize.define(
  'TeamMember',
  {
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'teams',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: 'team_members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['teamId', 'userId'],
      },
    ],
  }
);

module.exports = TeamMemberModel;
