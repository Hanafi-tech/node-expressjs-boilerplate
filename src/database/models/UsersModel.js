const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');
const bcrypt = require('bcryptjs');

const { DataTypes } = Sequelize;

const Users = db.define('Users', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refreshTokenExpiresAt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('administrator', 'user'),
    },
    status: {
        type: DataTypes.ENUM('active', 'not-active'),
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    }
}, {
    timestamps: false,
    freezeTableName: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    },
});

Users.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Users;
