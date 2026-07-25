'use strict';

const { DataTypes } = require('sequelize');
const db = require('@/config/database.js');

const ActivityLog = db.define('activity_logs', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: true, comment: 'null jika login gagal / user tidak ditemukan' },
  email:     { type: DataTypes.STRING,  allowNull: false },
  action:    {
    type:    DataTypes.ENUM('login_success', 'login_failed', 'login_mfa_required', 'logout', 'password_reset', 'token_refresh'),
    allowNull: false,
  },
  ipAddress: { type: DataTypes.STRING,  allowNull: true },
  userAgent: { type: DataTypes.TEXT,    allowNull: true },
  metadata:  { type: DataTypes.JSON,    allowNull: true, defaultValue: null, comment: 'Data tambahan, misal: remainingAttempts' },
  createdAt: { type: DataTypes.DATE,    allowNull: false },
  updatedAt: { type: DataTypes.DATE,    allowNull: false },
}, {
  timestamps:      true,
  freezeTableName: true,
});

module.exports = ActivityLog;
