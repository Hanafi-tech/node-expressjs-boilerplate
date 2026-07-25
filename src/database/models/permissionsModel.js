'use strict';
const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');
const PermissionActions = require('./permissionActionsModel.js');

const { DataTypes } = Sequelize;

const Permissions = db.define('rolepermissions', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
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

Permissions.hasMany(PermissionActions, { foreignKey: 'permissionsId', as: 'permissionActions' });

module.exports = Permissions;
