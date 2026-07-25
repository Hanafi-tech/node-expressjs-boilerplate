'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('audittrails', ['createdAt'], {
      name: 'idx_audittrails_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('audittrails', 'idx_audittrails_created_at');
  }
};