const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');

const { DataTypes } = Sequelize;

const ResetPassword = db.define('ResetPassword', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    to: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expireAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = ResetPassword;
