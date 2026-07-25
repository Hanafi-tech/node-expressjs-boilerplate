'use strict';
const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');

const { DataTypes } = Sequelize;

const PermissionActions = db.define('rolepermissionactions', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    permissionsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        allowNull: true,
        type: DataTypes.BOOLEAN
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    timestamps: true,
    freezeTableName: true
});

module.exports = PermissionActions;
