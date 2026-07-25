'use strict';

const { Op } = require('sequelize');
const Positions = require('@/database/models/positionModel');
const res_ = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');

// ── GET /positions ────────────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const count = await Positions.count({ where });
    const rows  = await Positions.findAll({ where, limit, offset, order: [['name', 'ASC']] });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── GET /positions/:id ────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const position = await Positions.findByPk(req.params.id);
    if (!position) return res_.notFound(res, 'Jabatan tidak ditemukan');
    return res_.success(res, position);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /positions ───────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, status } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await Positions.findOne({ where: { slug } });
    if (existing) return res_.badRequest(res, 'Jabatan dengan nama tersebut sudah ada');

    const position = await Positions.create({
      name, slug, status: status || 'active',
      createdAt: new Date(), updatedAt: new Date(),
    });

    return res_.created(res, position, 'Jabatan berhasil dibuat');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /positions/:id ────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const position = await Positions.findByPk(req.params.id);
    if (!position) return res_.notFound(res, 'Jabatan tidak ditemukan');

    const { name, status } = req.body;
    const slug = name
      ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : position.slug;

    if (name && name !== position.name) {
      const existing = await Positions.findOne({ where: { slug, id: { [Op.ne]: position.id } } });
      if (existing) return res_.badRequest(res, 'Jabatan dengan nama tersebut sudah ada');
    }

    await position.update({
      name:      name   || position.name,
      slug,
      status:    status || position.status,
      updatedAt: new Date(),
    });

    return res_.success(res, position, 'Jabatan berhasil diperbarui');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── DELETE /positions/:id ─────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const position = await Positions.findByPk(req.params.id);
    if (!position) return res_.notFound(res, 'Jabatan tidak ditemukan');

    // Cek apakah ada user dengan jabatan ini
    const Users = require('@/database/models/usersModel');
    const inUse = await Users.count({ where: { positionId: position.id } });
    if (inUse > 0) {
      return res_.badRequest(res, `Jabatan tidak bisa dihapus — masih digunakan oleh ${inUse} user`);
    }

    await position.destroy();
    return res_.success(res, null, 'Jabatan berhasil dihapus');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList, getById, create, update, remove };
