'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('app_settings', [
      { key: 'app_name',            value: 'Backend Boilerplate', type: 'string',  group: 'general',  label: 'Nama Aplikasi',               description: 'Nama aplikasi yang tampil di email dan UI', isPublic: true,  createdAt: now, updatedAt: now },
      { key: 'app_url',             value: 'http://localhost:3000', type: 'string', group: 'general',  label: 'URL Aplikasi',                description: 'Base URL aplikasi',                         isPublic: true,  createdAt: now, updatedAt: now },
      { key: 'maintenance_mode',    value: 'false',                type: 'boolean', group: 'general',  label: 'Mode Maintenance',            description: 'Aktifkan untuk menampilkan halaman maintenance', isPublic: true, createdAt: now, updatedAt: now },
      { key: 'max_upload_size_mb',  value: '10',                   type: 'number',  group: 'general',  label: 'Max Upload Size (MB)',        description: 'Ukuran maksimal file upload dalam MB',       isPublic: false, createdAt: now, updatedAt: now },
      { key: 'allowed_file_types',  value: '["jpg","jpeg","png","webp","pdf","xlsx","docx"]', type: 'json', group: 'general', label: 'Tipe File Diizinkan', description: 'Ekstensi file yang diperbolehkan untuk upload', isPublic: false, createdAt: now, updatedAt: now },
      { key: 'login_max_attempts',  value: '5',                    type: 'number',  group: 'security', label: 'Max Login Attempt',           description: 'Jumlah maksimal percobaan login sebelum lockout', isPublic: false, createdAt: now, updatedAt: now },
      { key: 'login_lockout_minutes', value: '30',                 type: 'number',  group: 'security', label: 'Lockout Duration (menit)',     description: 'Durasi lockout setelah login gagal berkali-kali', isPublic: false, createdAt: now, updatedAt: now },
      { key: 'jwt_expires_in',      value: '1h',                   type: 'string',  group: 'security', label: 'JWT Expiry',                  description: 'Masa berlaku JWT token (format: 1h, 30m, 7d)',  isPublic: false, createdAt: now, updatedAt: now },
      { key: 'pagination_default_size', value: '10',               type: 'number',  group: 'general',  label: 'Default Page Size',           description: 'Jumlah item per halaman secara default',         isPublic: false, createdAt: now, updatedAt: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('app_settings', null, {});
  },
};
