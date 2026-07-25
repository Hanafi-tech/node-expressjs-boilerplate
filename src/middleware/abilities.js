'use strict';

const { createMongoAbility, AbilityBuilder } = require('@casl/ability');
const Roles           = require('@/database/models/rolesModel.js');
const Permission      = require('@/database/models/permissionsModel.js');
const PermissionsAction = require('@/database/models/permissionActionsModel.js');
const redis           = require('@/config/redis.js');

// TTL cache permission per role: 10 menit
const CACHE_TTL = 60 * 10;
const cacheKey  = (roleId) => `casl:role:${roleId}`;

/**
 * Ambil permission dari DB berdasarkan roleId.
 * Hasil di-cache di Redis selama CACHE_TTL detik.
 */
const getRolePermissions = async (roleId) => {
  // 1. Coba ambil dari cache
  const cached = await redis.get(cacheKey(roleId));
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Cache corrupt — lanjut ke DB
    }
  }

  // 2. Ambil dari DB
  const role = await Roles.findOne({
    where: { id: roleId },
    attributes: ['name'],
    include: [
      {
        model: Permission,
        as: 'permissions',
        attributes: ['name'],
        include: [
          {
            model: PermissionsAction,
            as: 'permissionActions',
            attributes: ['action', 'subject'],
          },
        ],
      },
    ],
  });

  if (!role) return null;

  const result = { can: [], cannot: [] };
  role.permissions.forEach(permission => {
    const list = permission.name === 'can' ? result.can : result.cannot;
    permission.permissionActions.forEach(action => {
      list.push({ action: action.action, subject: action.subject });
    });
  });

  // 3. Simpan ke cache
  await redis.set(cacheKey(roleId), JSON.stringify(result), CACHE_TTL);

  return result;
};

/**
 * Invalidasi cache permission untuk roleId tertentu.
 * Dipanggil setelah role/permission diupdate.
 */
const invalidateRoleCache = async (roleId) => {
  await redis.del(cacheKey(roleId));
};

/**
 * Bangun CASL ability untuk user.
 * Super admin di-handle sebelum masuk ke sini (di checkAbility middleware).
 */
const defineAbilitiesFor = async (role, user) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  try {
    const permissions = await getRolePermissions(user.roleId);

    if (permissions) {
      permissions.can.forEach(p => can(p.action, p.subject));
      permissions.cannot.forEach(p => cannot(p.action, p.subject));
    } else {
      console.warn(`[abilities] Role ${user.roleId} tidak ditemukan di DB.`);
    }

    // Permission universal semua user terautentikasi
    can('read', 'dashboard');
    can('read', 'profile');
    can('read', 'notifications');
    can('create', 'notifications');
  } catch (error) {
    console.error('[abilities] Error fetching role permissions:', error.message);
    can('read', 'profile');
  }

  return build();
};

module.exports = { defineAbilitiesFor, invalidateRoleCache };
