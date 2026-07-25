'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Cek dulu apakah kolom ada sebelum drop (aman untuk re-run)
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.resetPasswordToken) {
      await queryInterface.removeColumn('users', 'resetPasswordToken');
    }
    if (tableDesc.resetPasswordExpiresAt) {
      await queryInterface.removeColumn('users', 'resetPasswordExpiresAt');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type: Sequelize.STRING, allowNull: true, defaultValue: null,
    });
    await queryInterface.addColumn('users', 'resetPasswordExpiresAt', {
      type: Sequelize.DATE, allowNull: true, defaultValue: null,
    });
  },
};
