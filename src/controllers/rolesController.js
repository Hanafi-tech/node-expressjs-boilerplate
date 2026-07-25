'use strict';

const { Op } = require('sequelize');

const Roles             = require('@/database/models/rolesModel.js');
const Permission        = require('@/database/models/permissionsModel.js');
const PermissionsAction = require('@/database/models/permissionActionsModel.js');
const Users             = require('@/database/models/usersModel');
const res_              = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');
const { invalidateRoleCache } = require('@/middleware/abilities.js');

const PROTECTED_ROLES = ['admin', 'supplier'];

// ── GET /data-roles ───────────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];

    const count = await Roles.count({ where });
    const rows  = await Roles.findAll({ where, limit, offset });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── GET /data-roles/:id ───────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const role = await Roles.findOne({
      where: { id: req.params.id },
      include: [{
        model: Permission, as: 'permissions', attributes: ['name'],
        include: [{ model: PermissionsAction, as: 'permissionActions', attributes: ['action', 'subject'] }],
      }],
    });
    if (!role) return res_.notFound(res, 'Role tidak ditemukan');

    const permissions = role.permissions.reduce((acc, perm) => {
      const subjectMap = new Map();
      perm.permissionActions.forEach(({ action, subject }) => {
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { subject, read: false, create: false, edit: false, delete: false });
        }
        subjectMap.get(subject)[action] = true;
      });
      acc.push({ name: perm.name, permissionActions: Array.from(subjectMap.values()) });
      return acc;
    }, []);

    return res_.success(res, { ...role.toJSON(), permissions });
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /data-roles ──────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, status, permissionsActions } = req.body;

    const existing = await Roles.findOne({ where: { name } });
    if (existing) return res_.badRequest(res, 'Role sudah ada');

    const role = await Roles.create({ name, status, updatedAt: new Date() });
    const permission = await Permission.create({ name: 'can', roleId: role.id });

    for (const item of permissionsActions) {
      const [action, subject] = item.split(' | ');
      if (!action || !subject) return res_.badRequest(res, "Format permission harus 'action | subject'");
      await PermissionsAction.create({ action: action.trim(), subject: subject.trim(), permissionsId: permission.id });
    }

    return res_.created(res, { id: role.id, name: role.name }, 'Role berhasil dibuat');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /data-roles ───────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id, name, status, permissionsActions } = req.body;

    const role = await Roles.findByPk(id);
    if (!role) return res_.notFound(res, 'Role tidak ditemukan');
    if (PROTECTED_ROLES.includes(name.toLowerCase())) {
      return res_.forbidden(res, `Role '${name}' tidak dapat diubah`);
    }
    if (role.name !== name) {
      const existingName = await Roles.findOne({ where: { name } });
      if (existingName) return res_.badRequest(res, 'Nama role sudah digunakan');
    }

    await role.update({ name, status, updatedAt: new Date() });
    await Users.update({ roleName: name }, { where: { roleId: id } });
    await Permission.destroy({ where: { roleId: role.id } });

    const permission = await Permission.create({ name: 'can', roleId: role.id });
    const actions = permissionsActions.map(item => {
      const [action, subject] = item.split(' | ').map(s => s.trim());
      if (!action || !subject) throw new Error("Format permission harus 'action | subject'");
      return { action, subject, permissionsId: permission.id };
    });
    await PermissionsAction.bulkCreate(actions);

    await invalidateRoleCache(id);

    return res_.success(res, null, 'Role berhasil diperbarui');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── DELETE /data-roles/:id ────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const role = await Roles.findOne({ where: { id: req.params.id } });
    if (!role) return res_.notFound(res, 'Role tidak ditemukan');
    if (PROTECTED_ROLES.includes(role.name.toLowerCase())) {
      return res_.forbidden(res, `Role '${role.name}' tidak dapat dihapus`);
    }

    await role.destroy();
    await invalidateRoleCache(req.params.id);

    return res_.success(res, null, 'Role berhasil dihapus');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList, getById, create, update, remove };
