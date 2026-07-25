'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      refreshToken: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      refreshTokenExpiresAt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      roleName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      positionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      positionName: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM("active", "not-active"), // Menggunakan enum yang sudah dibuat
        allowNull: false,
        defaultValue: "active",
      },
      isVendor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      group: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};