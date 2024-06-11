const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');

const { DataTypes } = Sequelize;

const EmailServices = db.define('EmailServices', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    service: {
        type: DataTypes.ENUM('smtp', 'gmail'),
        allowNull: false,
    },
    host: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    scure: {
        type: DataTypes.ENUM('1', '0'),
        allowNull: true,
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pass: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = EmailServices;
