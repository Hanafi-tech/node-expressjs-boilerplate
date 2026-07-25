'use strict';

const { DataTypes } = require('sequelize');
const db = require('@/config/database.js');

const ResetPassword = db.define('reset_passwords', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
    allowNull:     false,
  },
  token: {
    type:      DataTypes.STRING(64),
    allowNull: false,
    unique:    true,
  },
  email: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  usedAt: {
    type:      DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    comment:   'Diisi saat token digunakan — mencegah reuse',
  },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, {
  timestamps:      true,
  freezeTableName: true,
});

module.exports = ResetPassword;
