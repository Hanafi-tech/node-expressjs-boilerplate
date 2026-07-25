'use strict';

const cron = require('node-cron');
const { Op } = require('sequelize');

// Models yang memiliki soft delete (paranoid: true)
const Users        = require('@/database/models/usersModel.js');
const ResetPassword = require('@/database/models/resetPasswordModel.js');
const ActivityLog  = require('@/database/models/activityLogModel.js');

// ── Job 1: Purge soft-deleted records > 30 hari ───────────────────
const purgeSoftDeleted = async () => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 hari lalu
  try {
    const deleted = await Users.destroy({
      where: { deletedAt: { [Op.lte]: cutoff } },
      force: true,
    });
    if (deleted > 0) console.log(`[cron] Purged ${deleted} soft-deleted user(s)`);
  } catch (err) {
    console.error('[cron] purgeSoftDeleted error:', err.message);
  }
};

// ── Job 2: Hapus reset password token yang sudah expired / dipakai ─
const purgeExpiredResetTokens = async () => {
  try {
    const deleted = await ResetPassword.destroy({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lte]: new Date() } },
          { usedAt:    { [Op.ne]:  null } },
        ],
      },
    });
    if (deleted > 0) console.log(`[cron] Purged ${deleted} expired reset token(s)`);
  } catch (err) {
    console.error('[cron] purgeExpiredResetTokens error:', err.message);
  }
};

// ── Job 3: Hapus activity log > 90 hari ──────────────────────────
const purgeOldActivityLogs = async () => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  try {
    const deleted = await ActivityLog.destroy({
      where: { createdAt: { [Op.lte]: cutoff } },
    });
    if (deleted > 0) console.log(`[cron] Purged ${deleted} old activity log(s)`);
  } catch (err) {
    console.error('[cron] purgeOldActivityLogs error:', err.message);
  }
};

// ── Registrasi semua job ──────────────────────────────────────────
const runCron = () => {
  // Purge soft-deleted records — setiap hari jam 02:00
  cron.schedule('0 2 * * *', purgeSoftDeleted, { timezone: 'Asia/Jakarta' });

  // Purge expired reset tokens — setiap jam
  cron.schedule('0 * * * *', purgeExpiredResetTokens, { timezone: 'Asia/Jakarta' });

  // Purge old activity logs — setiap minggu hari Minggu jam 03:00
  cron.schedule('0 3 * * 0', purgeOldActivityLogs, { timezone: 'Asia/Jakarta' });

  console.log('[cron] Scheduler aktif: purge soft-deleted, expired tokens, old activity logs');
};

module.exports = { runCron, purgeSoftDeleted, purgeExpiredResetTokens, purgeOldActivityLogs };
