'use strict';

const ActivityLog = require('@/database/models/activityLogModel.js');

/**
 * Catat aktivitas user ke tabel activity_logs.
 * Fire-and-forget — tidak melempar error agar tidak mengganggu flow utama.
 *
 * @param {object} options
 * @param {number|null} options.userId
 * @param {string}      options.email
 * @param {string}      options.action   - Enum: login_success | login_failed | login_mfa_required | logout | password_reset | token_refresh
 * @param {object}      options.req      - Express request (untuk IP & user-agent)
 * @param {object}      [options.metadata]
 */
const log = async ({ userId, email, action, req, metadata = null }) => {
  try {
    const ipAddress = req
      ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null)
      : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;

    await ActivityLog.create({ userId, email, action, ipAddress, userAgent, metadata });
  } catch (err) {
    console.error('[activityLog] Gagal mencatat aktivitas:', err.message);
  }
};

module.exports = { log };
