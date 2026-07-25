'use strict';

const { DataTypes } = require('sequelize');
const db = require('@/config/database.js');

const AppSetting = db.define('app_settings', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    true,
    comment:   'Snake_case key, misal: maintenance_mode, max_upload_size_mb',
  },
  value:       { type: DataTypes.TEXT,    allowNull: true },
  type: {
    type:         DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    allowNull:    false,
    defaultValue: 'string',
    comment:      'Digunakan untuk parsing value otomatis',
  },
  group:       { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'general', comment: 'Grup setting: general, security, email, etc.' },
  label:       { type: DataTypes.STRING,     allowNull: true,  comment: 'Label untuk UI' },
  description: { type: DataTypes.TEXT,       allowNull: true },
  isPublic: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
    comment:      'Jika true, bisa diakses tanpa autentikasi via GET /settings/public',
  },
  createdAt:   { type: DataTypes.DATE, allowNull: false },
  updatedAt:   { type: DataTypes.DATE, allowNull: false },
}, {
  timestamps:      true,
  freezeTableName: true,
});

module.exports = AppSetting;
