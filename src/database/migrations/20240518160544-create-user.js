'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      refreshToken: {
        allowNull: true,
        type: Sequelize.STRING
      },
      refreshTokenExpiresAt: {
        allowNull: true,
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.ENUM('administrator', 'user'), // Menggunakan enum yang sudah dibuat
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'not-active'), // Menggunakan enum yang sudah dibuat
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};