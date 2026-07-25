'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type:         Sequelize.STRING,
      allowNull:    true,
      defaultValue: null,
    });
    await queryInterface.addColumn('users', 'resetPasswordExpiresAt', {
      type:         Sequelize.DATE,
      allowNull:    true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'resetPasswordToken');
    await queryInterface.removeColumn('users', 'resetPasswordExpiresAt');
  },
};
