'use strict';

const path = require('path');
const fs   = require('fs');
const { Op } = require('sequelize');

const Users         = require('@/database/models/usersModel.js');
const PositionModel = require('@/database/models/positionModel');
const Roles         = require('@/database/models/rolesModel');
const res_          = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');
const { invalidateUserSession } = require('@/middleware/authJwt.js');

const ALLOWED_IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_IMAGE_SIZE       = 2 * 1024 * 1024; // 2 MB

const SAFE_ATTRIBUTES = { exclude: ['password', 'refreshToken', 'refreshTokenExpiresAt', 'mfaSecret', 'mfaBackupCodes', 'resetPasswordToken'] };

// ── GET /data-users ───────────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { status, search } = req.query;

    const where = { isVendor: false };
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Op.or] = [
        { name:  { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const count = await Users.count({ where });
    const rows  = await Users.findAll({ where, limit, offset, attributes: SAFE_ATTRIBUTES });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── GET /data-users/additional-data ──────────────────────────────
const getAdditionalData = async (req, res) => {
  try {
    const [positions, roles] = await Promise.all([
      PositionModel.findAll({ where: { status: 'active' } }),
      Roles.findAll({ where: { status: 'active' } }),
    ]);

    let code, isUnique = false;
    while (!isUnique) {
      code = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const existing = await Users.findOne({ where: { code } });
      if (!existing) isUnique = true;
    }

    return res_.success(res, { positions, roles, code });
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── GET /data-users/:id ───────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id, { attributes: SAFE_ATTRIBUTES });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');
    return res_.success(res, user);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /data-users ──────────────────────────────────────────────
const create = async (req, res) => {
  const transaction = await Users.sequelize.transaction();
  try {
    const { code, name, email, password, roleId, positionId, group, status } = req.body;

    const role = await Roles.findOne({ where: { id: roleId }, transaction });
    if (!role) { await transaction.rollback(); return res_.badRequest(res, 'Role tidak ditemukan'); }

    let positionName = role.name === 'admin' ? 'superadmin' : null;
    if (role.name !== 'admin') {
      if (!positionId) { await transaction.rollback(); return res_.badRequest(res, 'positionId wajib diisi untuk role ini'); }
      const position = await PositionModel.findByPk(positionId, { transaction });
      if (!position) { await transaction.rollback(); return res_.badRequest(res, 'Position tidak ditemukan'); }
      positionName = position.name;
    }

    const existEmail = await Users.findOne({ where: { email }, transaction });
    if (existEmail) { await transaction.rollback(); return res_.badRequest(res, 'Email sudah digunakan'); }

    let imageName = null;
    if (req.files && req.files.image) {
      const result = await _handleImageUpload(req.files.image, transaction);
      if (result.error) { await transaction.rollback(); return res_.unprocessable(res, result.error); }
      imageName = result.filename;
    }

    const user = await Users.create({
      code, name, email, password,
      roleId, roleName: role.name,
      positionId: positionId || null, positionName,
      group: group || null,
      status: status || 'active',
      image: imageName,
    }, { transaction });

    await transaction.commit();

    const safe = _safeUser(user);
    return res_.created(res, safe, 'User berhasil dibuat');
  } catch (err) {
    await transaction.rollback();
    return res_.serverError(res, err.message);
  }
};

// ── PUT /data-users ───────────────────────────────────────────────
const update = async (req, res) => {
  const transaction = await Users.sequelize.transaction();
  try {
    const { code, name, email, password, roleId, positionId, group, status } = req.body;

    const role = await Roles.findOne({ where: { id: roleId }, transaction });
    if (!role) { await transaction.rollback(); return res_.badRequest(res, 'Role tidak ditemukan'); }

    let positionName = role.name === 'admin' ? 'superadmin' : null;
    if (role.name !== 'admin') {
      if (!positionId) { await transaction.rollback(); return res_.badRequest(res, 'positionId wajib diisi untuk role ini'); }
      const position = await PositionModel.findByPk(positionId, { transaction });
      if (!position) { await transaction.rollback(); return res_.badRequest(res, 'Position tidak ditemukan'); }
      positionName = position.name;
    }

    const user = await Users.findOne({ where: { code }, transaction });
    if (!user) { await transaction.rollback(); return res_.notFound(res, 'User tidak ditemukan'); }

    if (email !== user.email) {
      const existEmail = await Users.findOne({ where: { email, id: { [Op.ne]: user.id } }, transaction });
      if (existEmail) { await transaction.rollback(); return res_.badRequest(res, 'Email sudah digunakan'); }
    }

    let imageName = user.image;
    if (req.files && req.files.image) {
      const result = await _handleImageUpload(req.files.image, transaction);
      if (result.error) { await transaction.rollback(); return res_.unprocessable(res, result.error); }
      if (user.image) _deleteImage(user.image);
      imageName = result.filename;
    }

    const updatePayload = {
      name, email,
      roleId, roleName: role.name,
      positionId: positionId || null, positionName,
      group: group || null,
      status: status || user.status,
      image: imageName,
    };
    if (password) updatePayload.password = password;

    await user.update(updatePayload, { transaction });
    await transaction.commit();
    await invalidateUserSession(user.id);

    return res_.success(res, _safeUser(user), 'User berhasil diperbarui');
  } catch (err) {
    await transaction.rollback();
    return res_.serverError(res, err.message);
  }
};

// ── DELETE /data-users/:id ────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);
    if (!user) return res_.notFound(res, 'User tidak ditemukan');
    await user.destroy();
    await invalidateUserSession(req.params.id);
    return res_.success(res, null, 'User berhasil dihapus');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── Private helpers ───────────────────────────────────────────────
const _handleImageUpload = async (image) => {
  const ext = path.extname(image.name || '').toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.includes(ext)) {
    return { error: `Format file tidak didukung. Gunakan: ${ALLOWED_IMAGE_TYPES.join(', ')}` };
  }
  if (image.size > MAX_IMAGE_SIZE) {
    return { error: 'Ukuran file maksimal 2MB' };
  }
  const filename = `${Math.random().toString(36).substr(2, 9)}-${Date.now()}${ext}`;
  const destPath = path.join(__dirname, '../public/image', filename);
  await image.mv(destPath);
  return { filename };
};

const _deleteImage = (filename) => {
  const filePath = path.join(__dirname, '../public/image', filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const _safeUser = (user) => {
  const data = user.toJSON ? user.toJSON() : { ...user };
  ['password', 'mfaSecret', 'mfaBackupCodes', 'resetPasswordToken', 'refreshToken'].forEach(k => delete data[k]);
  return data;
};

module.exports = { getList, getById, getAdditionalData, create, update, remove };
