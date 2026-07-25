'use strict';

const { Op } = require('sequelize');

const AuditTrails = require('@/database/models/audittrailModel');
const res_        = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');

// ── GET /audit-trails ─────────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { userName:    { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const count = await AuditTrails.count({ where });
    const rows  = await AuditTrails.findAll({ where, order: [['id', 'DESC']], limit, offset });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList };
