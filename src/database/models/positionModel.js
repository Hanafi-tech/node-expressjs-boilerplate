'use strict';
const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');

const { DataTypes } = Sequelize;

const Positions = db.define('positions', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    slug: {
        allowNull: false,
        type: DataTypes.STRING
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM('active', 'not-active')
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Positions;
