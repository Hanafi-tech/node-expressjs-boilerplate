'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('listpermission', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nameparentmenu: {
        allowNull: false,
        type: Sequelize.STRING
      },
      namemenu: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isread: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      nameRead: {
        allowNull: false,
        type: Sequelize.STRING
      },
      iscreate: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
      nameCreate: {
        allowNull: true,
        type: Sequelize.STRING
      },
      isedit: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
      nameEdit: {
        allowNull: true,
        type: Sequelize.STRING
      },
      isdelete: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
      nameDelete: {
        allowNull: true,
        type: Sequelize.STRING
      },
      subject: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Date.now()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Date.now()
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('listpermission');
  }
};
