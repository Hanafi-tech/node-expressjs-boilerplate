'use strict';

const { getIO } = require('@/lib/socket');
const NotificationModel = require('@/database/models/notificationModel');
const Users = require('@/database/models/usersModel');
const { Op } = require('sequelize');

/**
 * Kirim notifikasi ke user tertentu berdasarkan array userId.
 *
 * @param {number[]} userIds      - Array ID user penerima notifikasi
 * @param {string}   title        - Judul notifikasi
 * @param {string}   message      - Isi notifikasi
 * @param {object}   [data={}]    - Data tambahan (opsional)
 * @param {number}   [createdBy]  - ID user pembuat notifikasi
 * @returns {Promise<object[]>}   - Array record notifikasi yang dibuat
 */
const sendNotificationToUsers = async (userIds, title, message, data = {}, createdBy = 0) => {
  if (!userIds || userIds.length === 0) return [];

  const now = new Date();
  const records = userIds.map(userId => ({
    user_id:    userId,
    type:       'INFO',
    title,
    message,
    data:       JSON.stringify(data),
    createdBy,
    created_at: now,
    updated_at: now,
  }));

  const notifications = await NotificationModel.bulkCreate(records);

  const io = getIO();
  userIds.forEach(userId => {
    io.to(`user_${userId}`).emit('new_notification', { title, message });
  });

  return notifications;
};

/**
 * Kirim notifikasi ke user berdasarkan filter posisi/role.
 * Berguna untuk broadcast ke role tertentu dalam satu tenant.
 *
 * @param {object} filter         - Sequelize where clause untuk filter user
 * @param {string} title
 * @param {string} message
 * @param {object} [data={}]
 * @param {number} [createdBy=0]
 */
const sendNotificationByFilter = async (filter, title, message, data = {}, createdBy = 0) => {
  const users = await Users.findAll({ where: filter, attributes: ['id'] });
  if (!users || users.length === 0) return [];

  const userIds = users.map(u => u.id);
  return sendNotificationToUsers(userIds, title, message, data, createdBy);
};

module.exports = { sendNotificationToUsers, sendNotificationByFilter };
