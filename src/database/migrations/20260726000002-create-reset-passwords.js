'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reset_passwords', {
      id:        { type: Sequelize.INTEGER,     primaryKey: true, autoIncrement: true, allowNull: false },
      token:     { type: Sequelize.STRING(64),  allowNull: false, unique: true },
      email:     { type: Sequelize.STRING,      allowNull: false },
      expiresAt: { type: Sequelize.DATE,        allowNull: false },
      usedAt:    { type: Sequelize.DATE,        allowNull: true, defaultValue: null },
      createdAt: { type: Sequelize.DATE,        allowNull: false },
      updatedAt: { type: Sequelize.DATE,        allowNull: false },
    });

    await queryInterface.addIndex('reset_passwords', ['token']);
    await queryInterface.addIndex('reset_passwords', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reset_passwords');
  },
};
