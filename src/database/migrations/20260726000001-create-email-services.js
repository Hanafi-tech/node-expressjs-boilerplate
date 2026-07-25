'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_services', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name:      { type: Sequelize.STRING,  allowNull: false },
      service:   { type: Sequelize.ENUM('smtp', 'gmail', 'sendgrid', 'other'), allowNull: false, defaultValue: 'smtp' },
      host:      { type: Sequelize.STRING,  allowNull: true },
      port:      { type: Sequelize.INTEGER, allowNull: true, defaultValue: 587 },
      secure:    { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      user:      { type: Sequelize.STRING,  allowNull: false },
      pass:      { type: Sequelize.STRING,  allowNull: false },
      fromName:  { type: Sequelize.STRING,  allowNull: true, defaultValue: null },
      isActive:  { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE,    allowNull: false },
      updatedAt: { type: Sequelize.DATE,    allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_services');
  },
};
