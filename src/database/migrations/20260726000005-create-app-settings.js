'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('app_settings', {
      id:          { type: Sequelize.INTEGER,      primaryKey: true, autoIncrement: true },
      key:         { type: Sequelize.STRING(100),  allowNull: false, unique: true },
      value:       { type: Sequelize.TEXT,         allowNull: true },
      type:        { type: Sequelize.ENUM('string','number','boolean','json'), allowNull: false, defaultValue: 'string' },
      group:       { type: Sequelize.STRING(50),   allowNull: true, defaultValue: 'general' },
      label:       { type: Sequelize.STRING,       allowNull: true },
      description: { type: Sequelize.TEXT,         allowNull: true },
      isPublic:    { type: Sequelize.BOOLEAN,      allowNull: false, defaultValue: false },
      createdAt:   { type: Sequelize.DATE,         allowNull: false },
      updatedAt:   { type: Sequelize.DATE,         allowNull: false },
    });
    await queryInterface.addIndex('app_settings', ['key']);
    await queryInterface.addIndex('app_settings', ['group']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('app_settings');
  },
};
