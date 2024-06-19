require('dotenv').config();

const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('./config.js')[env];

const db = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    timezone: '+07:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

module.exports = db;