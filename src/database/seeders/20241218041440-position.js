'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('positions', [
      {
        name: 'Sales',
        slug: 'sales',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Group Leader',
        slug: 'group-leader',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Manager',
        slug: 'manager',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'President Director',
        slug: 'president-director',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('positions', null, {});
  }
};
