'use strict';

/**
 * Seeder: Konfigurasi email service default.
 * Ganti value sesuai SMTP provider Anda setelah deploy.
 * Password bisa diubah via API: PUT /mail/config/:id
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('email_services', [
      {
        name:      'SMTP Utama',
        service:   'smtp',
        host:      'smtp.example.com',
        port:      587,
        secure:    false,
        user:      'noreply@example.com',
        pass:      'change-me-in-production',
        fromName:  'Backend Boilerplate',
        isActive:  true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('email_services', null, {});
  },
};
