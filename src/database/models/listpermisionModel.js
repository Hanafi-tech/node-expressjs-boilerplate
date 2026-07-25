'use strict';
const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');

const { DataTypes } = Sequelize;

const ListPermissionModel = db.define('listpermission', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    nameparentmenu: {
        allowNull: false,
        type: DataTypes.STRING
    },
    namemenu: {
        allowNull: false,
        type: DataTypes.STRING
    },
    isread: {
        allowNull: true,
        type: DataTypes.BOOLEAN
    },
    nameRead: {
        allowNull: true,
        type: DataTypes.STRING
    },
    iscreate: {
        allowNull: true,
        type: DataTypes.BOOLEAN
    },
    nameCreate: {
        allowNull: true,
        type: DataTypes.STRING
    },
    isedit: {
        allowNull: true,
        type: DataTypes.BOOLEAN
    },
    nameEdit: {
        allowNull: true,
        type: DataTypes.STRING
    },
    isdelete: {
        allowNull: true,
        type: DataTypes.BOOLEAN
    },
    nameDelete: {
        allowNull: true,
        type: DataTypes.STRING
    },
    subject: {
        allowNull: false,
        type: DataTypes.STRING
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

module.exports = ListPermissionModel;
