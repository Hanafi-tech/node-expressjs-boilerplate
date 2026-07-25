'use strict';
const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');
const Permissions = require('./permissionsModel.js');

const { DataTypes } = Sequelize;

const Roles = db.define('roles', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
    },
    updateBy: {
        allowNull: true,
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
});

// Asosiasi
Roles.hasMany(Permissions, { foreignKey: 'roleId', as: 'permissions' });

module.exports = Roles;
