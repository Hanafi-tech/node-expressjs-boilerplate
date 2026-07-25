'use strict';
require('dotenv').config();

const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('./config.js')[env];

const db = new Sequelize(config.database, config.username, config.password, {
  host:     config.host,
  port:     config.port,
  dialect:  config.dialect,
  timezone: '+07:00',
  logging:  false,
  pool: {
    max:     20,
    min:     0,
    acquire: 60000,
    idle:    10000,
  },
});

module.exports = db;
