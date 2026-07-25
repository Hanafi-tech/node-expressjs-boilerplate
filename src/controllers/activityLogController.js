'use strict';

const { Op } = require('sequelize');
const ActivityLog = require('@/database/models/activityLogModel.js');
const res_ = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');

// ── GET /activity-logs ────────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { userId, email, action, from, to } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (email)  where.email  = { [Op.iLike]: `%${email}%` };
    if (action) where.action = action;
    if (from && to) {
      where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
    } else if (from) {
      where.createdAt = { [Op.gte]: new Date(from) };
    } else if (to) {
      where.createdAt = { [Op.lte]: new Date(to) };
    }

    const count = await ActivityLog.count({ where });
    const rows  = await ActivityLog.findAll({
      where, limit, offset, order: [['createdAt', 'DESC']],
    });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── GET /activity-logs/me ─────────────────────────────────────────
const getMyActivity = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const where = { userId: req.user.id };

    const count = await ActivityLog.count({ where });
    const rows  = await ActivityLog.findAll({
      where, limit, offset, order: [['createdAt', 'DESC']],
    });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList, getMyActivity };
