'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const db     = require('@/config/database.js');
const bcrypt = require('bcryptjs');

const Users = db.define('users', {
  id: {
    type: DataTypes.INTEGER, primaryKey: true,
    autoIncrement: true, allowNull: false,
  },
  code:                  { type: DataTypes.STRING,  allowNull: false },
  name:                  { type: DataTypes.STRING,  allowNull: false },
  email:                 { type: DataTypes.STRING,  allowNull: false, unique: true },
  password:              { type: DataTypes.STRING,  allowNull: false },
  refreshToken:          { type: DataTypes.STRING,  allowNull: true },
  refreshTokenExpiresAt: { type: DataTypes.STRING,  allowNull: true },
  roleId:                { type: DataTypes.INTEGER, allowNull: true },
  roleName:              { type: DataTypes.STRING,  allowNull: true },
  positionId:            { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  positionName:          { type: DataTypes.STRING,  allowNull: false, defaultValue: '' },
  status:                { type: DataTypes.ENUM('active', 'not-active'), allowNull: false, defaultValue: 'active' },
  isVendor:              { type: DataTypes.BOOLEAN, defaultValue: false },
  group:                 { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
  image:                 { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
  mfaSecret:             { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
  mfaBackupCodes:        { type: DataTypes.JSON,    allowNull: true, defaultValue: null },
  mfaEnabled:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  paranoid:        true,
  timestamps:      true,
  freezeTableName: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
    },
  },
});

Users.prototype.validPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = Users;
