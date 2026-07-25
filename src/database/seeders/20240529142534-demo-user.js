'use strict';
const bcrypt = require('bcryptjs');

/**
 * Seeder: User demo untuk development.
 * Password default: Dev@1234! — GANTI sebelum deploy ke production.
 */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('Dev@1234!', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        code:         'USR-000001',
        name:         'Administrator',
        email:        'admin@example.com',
        password:     hashedPassword,
        roleId:       1,
        roleName:     'admin',
        positionId:   1,
        positionName: 'superadmin',
        status:       'active',
        isSuperAdmin: false,
        isVendor:     false,
        mfaEnabled:   false,
        createdAt:    now,
        updatedAt:    now,
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  },
};
