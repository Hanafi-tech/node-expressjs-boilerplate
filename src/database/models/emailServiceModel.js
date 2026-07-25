'use strict';

const { DataTypes } = require('sequelize');
const db = require('@/config/database.js');

const EmailService = db.define('email_services', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
    allowNull:     false,
  },
  name: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'Label konfigurasi, misal: "SMTP Utama"',
  },
  service: {
    type:         DataTypes.ENUM('smtp', 'gmail', 'sendgrid', 'other'),
    allowNull:    false,
    defaultValue: 'smtp',
  },
  host: {
    type:      DataTypes.STRING,
    allowNull: true,
  },
  port: {
    type:         DataTypes.INTEGER,
    allowNull:    true,
    defaultValue: 587,
  },
  secure: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
    comment:      'true = SSL/TLS (port 465), false = STARTTLS (port 587)',
  },
  user: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'Email pengirim / username SMTP',
  },
  pass: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'Password / App Password SMTP',
  },
  fromName: {
    type:         DataTypes.STRING,
    allowNull:    true,
    defaultValue: null,
    comment:      'Nama pengirim yang tampil di email',
  },
  isActive: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
    comment:      'Hanya satu config yang aktif pada satu waktu',
  },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, {
  timestamps:      true,
  freezeTableName: true,
});

module.exports = EmailService;
