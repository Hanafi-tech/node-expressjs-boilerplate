'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'mfaSecret', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Menyimpan secret key TOTP (Base32)'
    });

    await queryInterface.addColumn('users', 'mfaBackupCodes', {
      type: Sequelize.JSON, // Postgres support JSON natif. Jika error, ganti ke TEXT
      allowNull: true,
      comment: 'Menyimpan array backup codes'
    });

    await queryInterface.addColumn('users', 'mfaEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Status apakah user sudah mengaktifkan MFA'
    });
  },

  async down(queryInterface, Sequelize) {
    // Menghapus kolom jika migrasi di-rollback
    await queryInterface.removeColumn('users', 'mfaSecret');
    await queryInterface.removeColumn('users', 'mfaBackupCodes');
    await queryInterface.removeColumn('users', 'mfaEnabled');
  }
};