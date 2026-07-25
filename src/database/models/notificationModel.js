'use strict';
const { Sequelize } = require('sequelize');
const db = require('../../config/database.js');

const { DataTypes } = Sequelize;

const NotificationModel = db.define('notifications', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'INFO'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isRead: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.read_at !== null;
        },
        set(value) {
            throw new Error('Do not try to set the `isRead` value!');
        }
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
}, {
    timestamps: false,
    freezeTableName: true
});

NotificationModel.prototype.markAsRead = function () {
    this.read_at = new Date();
    return this.save();
};
module.exports = NotificationModel;
