'use strict';

/**
 * Seeder: Role & Permission default boilerplate.
 *
 * Roles yang dibuat:
 *   1. admin   — akses penuh ke semua fitur
 *   2. staff   — akses baca + kelola data operasional
 *   3. viewer  — akses baca saja
 *
 * Tambahkan atau sesuaikan subject dengan route yang ada di aplikasi Anda.
 */

const ROLES = [
  { id: 1, name: 'admin',  status: 'active' },
  { id: 2, name: 'staff',  status: 'active' },
  { id: 3, name: 'viewer', status: 'active' },
];

// Subject yang tersedia di boilerplate ini
const SUBJECTS = [
  'dashboard',
  'profile',
  'data-users',
  'data-roles',
  'listpermission',
  'audit-trails',
  'notifications',
];

const ACTIONS = ['read', 'create', 'edit', 'delete'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ── Insert Roles ─────────────────────────────────────────────
    await queryInterface.bulkInsert('roles', ROLES.map(r => ({
      ...r,
      createdAt: now,
      updatedAt: now,
    })));

    // ── Insert Permissions (satu "can" per role) ─────────────────
    const permissions = ROLES.map(r => ({
      roleId:    r.id,
      name:      'can',
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('rolepermissions', permissions);

    // Fetch ID permissions yang baru dibuat
    const [inserted] = await queryInterface.sequelize.query(
      `SELECT id, "roleId" FROM rolepermissions WHERE "roleId" IN (${ROLES.map(r => r.id).join(',')}) ORDER BY id ASC`
    );

    // Map roleId → permissionId
    const permMap = {};
    inserted.forEach(p => { permMap[p.roleId] = p.id; });

    // ── Admin: semua aksi di semua subject ───────────────────────
    const adminActions = SUBJECTS.flatMap(subject =>
      ACTIONS.map(action => ({
        permissionsId: permMap[1],
        action,
        subject,
        createdAt: now,
        updatedAt: now,
      }))
    );

    // ── Staff: CRUD operasional (bukan roles & audit) ────────────
    const staffSubjects = ['dashboard', 'profile', 'notifications'];
    const staffActions  = staffSubjects.flatMap(subject =>
      ACTIONS.map(action => ({
        permissionsId: permMap[2],
        action,
        subject,
        createdAt: now,
        updatedAt: now,
      }))
    );

    // ── Viewer: hanya read ───────────────────────────────────────
    const viewerSubjects = ['dashboard', 'profile', 'notifications', 'audit-trails'];
    const viewerActions  = viewerSubjects.map(subject => ({
      permissionsId: permMap[3],
      action:        'read',
      subject,
      createdAt:     now,
      updatedAt:     now,
    }));

    await queryInterface.bulkInsert(
      'rolepermissionactions',
      [...adminActions, ...staffActions, ...viewerActions]
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('rolepermissionactions', null, {});
    await queryInterface.bulkDelete('rolepermissions',       null, {});
    await queryInterface.bulkDelete('roles',                 null, {});
  },
};
