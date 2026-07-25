'use strict';

const { Op } = require('sequelize');

const NotificationModel = require('@/database/models/notificationModel');
const res_ = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');

// ── GET /notifications ────────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { search, filter } = req.query;

    const where = { user_id: req.user.id };
    if (search) {
      where[Op.or] = [
        { title:   { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (filter === 'unread') where.read_at = null;

    const { rows, count } = await NotificationModel.findAndCountAll({
      where, order: [['id', 'DESC']], limit, offset,
    });

    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /notifications/mark-as-read ─────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await NotificationModel.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notification) return res_.notFound(res, 'Notification tidak ditemukan');
    await notification.update({ read_at: new Date() });
    return res_.success(res, notification);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /notifications/mark-all-as-read ─────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await NotificationModel.update(
      { read_at: new Date() },
      { where: { user_id: req.user.id, read_at: null } }
    );
    return res_.success(res, null, 'Semua notifikasi ditandai sudah dibaca');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /notifications/clear ─────────────────────────────────────
const clear = async (req, res) => {
  try {
    await NotificationModel.destroy({ where: { user_id: req.user.id } });
    return res_.success(res, null, 'Semua notifikasi dihapus');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList, markAsRead, markAllAsRead, clear };
