'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_logs', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:    { type: Sequelize.INTEGER, allowNull: true },
      email:     { type: Sequelize.STRING,  allowNull: false },
      action:    { type: Sequelize.ENUM('login_success','login_failed','login_mfa_required','logout','password_reset','token_refresh'), allowNull: false },
      ipAddress: { type: Sequelize.STRING,  allowNull: true },
      userAgent: { type: Sequelize.TEXT,    allowNull: true },
      metadata:  { type: Sequelize.JSON,    allowNull: true, defaultValue: null },
      createdAt: { type: Sequelize.DATE,    allowNull: false },
      updatedAt: { type: Sequelize.DATE,    allowNull: false },
    });
    await queryInterface.addIndex('activity_logs', ['userId']);
    await queryInterface.addIndex('activity_logs', ['email']);
    await queryInterface.addIndex('activity_logs', ['action']);
    await queryInterface.addIndex('activity_logs', ['createdAt']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('activity_logs');
  },
};
