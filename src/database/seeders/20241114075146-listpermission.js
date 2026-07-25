'use strict';

/**
 * Seeder: List Permission — katalog fitur yang bisa diatur per role.
 *
 * Tabel ini digunakan sebagai referensi UI untuk membangun form permission.
 * Tambahkan entry baru setiap kali Anda menambah fitur/route baru.
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const entries = [
      // ── Dashboard ──────────────────────────────────────────────
      {
        nameparentmenu: 'Dashboard', namemenu: 'Dashboard',
        isread: true,  nameRead:   'Lihat Dashboard',
        iscreate: false, nameCreate: null,
        isedit: false,   nameEdit:   null,
        isdelete: false, nameDelete: null,
        subject: 'dashboard', createdAt: now, updatedAt: now,
      },

      // ── Master Data: Users ─────────────────────────────────────
      {
        nameparentmenu: 'Master Data', namemenu: 'Data Users',
        isread: true,  nameRead:   'Lihat User',
        iscreate: true, nameCreate: 'Tambah User',
        isedit: true,   nameEdit:   'Edit User',
        isdelete: true, nameDelete: 'Hapus User',
        subject: 'data-users', createdAt: now, updatedAt: now,
      },

      // ── Master Data: Roles ─────────────────────────────────────
      {
        nameparentmenu: 'Master Data', namemenu: 'Data Roles',
        isread: true,  nameRead:   'Lihat Role',
        iscreate: true, nameCreate: 'Tambah Role',
        isedit: true,   nameEdit:   'Edit Role',
        isdelete: true, nameDelete: 'Hapus Role',
        subject: 'data-roles', createdAt: now, updatedAt: now,
      },

      // ── Master Data: List Permission ───────────────────────────
      {
        nameparentmenu: 'Master Data', namemenu: 'List Permission',
        isread: true,  nameRead:   'Lihat Permission',
        iscreate: false, nameCreate: null,
        isedit: false,   nameEdit:   null,
        isdelete: false, nameDelete: null,
        subject: 'listpermission', createdAt: now, updatedAt: now,
      },

      // ── System: Audit Trail ────────────────────────────────────
      {
        nameparentmenu: 'System', namemenu: 'Audit Trail',
        isread: true,  nameRead:   'Lihat Audit Trail',
        iscreate: false, nameCreate: null,
        isedit: false,   nameEdit:   null,
        isdelete: false, nameDelete: null,
        subject: 'audit-trails', createdAt: now, updatedAt: now,
      },

      // ── System: Notifikasi ─────────────────────────────────────
      {
        nameparentmenu: 'System', namemenu: 'Notifikasi',
        isread: true,  nameRead:   'Lihat Notifikasi',
        iscreate: true, nameCreate: 'Kirim Notifikasi',
        isedit: false,   nameEdit:   null,
        isdelete: false, nameDelete: null,
        subject: 'notifications', createdAt: now, updatedAt: now,
      },

      // ── Settings: Profile ──────────────────────────────────────
      {
        nameparentmenu: 'Settings', namemenu: 'Profile',
        isread: true,  nameRead:   'Lihat Profile',
        iscreate: false, nameCreate: null,
        isedit: true,   nameEdit:   'Edit Profile',
        isdelete: false, nameDelete: null,
        subject: 'profile', createdAt: now, updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('listpermission', entries);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('listpermission', null, {});
  },
};
