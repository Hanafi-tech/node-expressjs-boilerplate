'use strict';

const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const moment  = require('moment-timezone');
const bcrypt  = require('bcryptjs');
const OTPAuth = require('otpauth');

const Users         = require('@/database/models/usersModel.js');
const ResetPassword = require('@/database/models/resetPasswordModel.js');
const res_          = require('@/lib/utils/response.js');
const { invalidateUserSession } = require('@/middleware/authJwt.js');
const { recordFailedAttempt, resetAttempts, getRemainingAttempts } = require('@/middleware/bruteForce.js');
const activityLog = require('@/lib/services/activityLogService.js');

// ── Private: generate JWT + refresh token ────────────────────────
const _generateTokens = (user) => {
  const payload = {
    id:           user.id,
    name:         user.name,
    email:        user.email,
    role:         (user.roleName || '').toLowerCase(),
    roleId:       user.roleId,
    positionName: user.positionName,
    group:        user.group,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  const refreshToken      = crypto.randomBytes(40).toString('hex');
  const refreshExpiresIn  = parseInt(process.env.REFRESH_TOKEN_EXPIRES_SECONDS || String(60 * 60 * 24 * 7), 10);
  const refreshTokenExpiresAt = moment().tz('Asia/Jakarta').add(refreshExpiresIn, 'seconds').toISOString();

  return { token, refreshToken, refreshTokenExpiresAt };
};

// ── Private: validasi MFA ─────────────────────────────────────────
const _validateMfa = async (user, mfaCode) => {
  let valid = false;
  let usedBackupCode = false;

  if (user.mfaSecret) {
    try {
      const totp = new OTPAuth.TOTP({
        algorithm: 'SHA1', digits: 6, period: 30,
        secret: OTPAuth.Secret.fromBase32(user.mfaSecret),
      });
      if (totp.validate({ token: mfaCode, window: 1 }) !== null) valid = true;
    } catch (err) {
      console.error('[auth] MFA TOTP error:', err.message);
    }
  }

  if (!valid && Array.isArray(user.mfaBackupCodes) && user.mfaBackupCodes.includes(mfaCode)) {
    valid = true;
    usedBackupCode = true;
  }

  return { valid, usedBackupCode };
};

// ── POST /login ───────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, mfaCode } = req.body;

    const user = await Users.findOne({ where: { email } });
    // Selalu jalankan bcrypt compare untuk mencegah timing attack
    // (attacker bisa tahu apakah email terdaftar dari perbedaan response time)
    const passwordValid = user ? await user.validPassword(password) : await bcrypt.compare(password, '$2b$10$invalidhashXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    if (!user || !passwordValid) {
      if (user) await recordFailedAttempt(email);
      const remaining = await getRemainingAttempts(email);
      await activityLog.log({ userId: user?.id || null, email, action: 'login_failed', req, metadata: { remainingAttempts: remaining } });
      return res_.badRequest(res, 'Invalid credentials', { remainingAttempts: remaining });
    }
    if (user.status !== 'active') {
      return res_.forbidden(res, 'Your account is not active');
    }

    if (user.mfaEnabled) {
      if (!mfaCode) {
        await activityLog.log({ userId: user.id, email, action: 'login_mfa_required', req });
        return res_.success(res, { mfaRequired: true }, 'MFA code required');
      }
      const { valid, usedBackupCode } = await _validateMfa(user, mfaCode);
      if (!valid) return res_.badRequest(res, 'Invalid MFA code or backup code');
      if (usedBackupCode) {
        await user.update({ mfaBackupCodes: user.mfaBackupCodes.filter(c => c !== mfaCode) });
      }
    }

    const { token, refreshToken, refreshTokenExpiresAt } = _generateTokens(user);
    await user.update({ refreshToken, refreshTokenExpiresAt });
    await invalidateUserSession(user.id);
    await resetAttempts(email);
    await activityLog.log({ userId: user.id, email, action: 'login_success', req });

    return res_.success(res, { token, refreshToken }, 'Login successful');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /logout ──────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });
    if (user) await user.update({ refreshToken: null, refreshTokenExpiresAt: null });
    await invalidateUserSession(req.user.id);
    await activityLog.log({ userId: req.user.id, email: req.user.email, action: 'logout', req });
    return res_.success(res, null, 'Logout successful');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /refreshtoken ────────────────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    const user = await Users.findOne({ where: { refreshToken: token } });
    if (!user) return res_.badRequest(res, 'Invalid refresh token');
    if (moment().isAfter(user.refreshTokenExpiresAt)) {
      return res_.unauthorized(res, 'Refresh token has expired');
    }

    const { token: newToken, refreshToken: newRefreshToken, refreshTokenExpiresAt } = _generateTokens(user);
    await user.update({ refreshToken: newRefreshToken, refreshTokenExpiresAt });
    await invalidateUserSession(user.id);
    await activityLog.log({ userId: user.id, email: user.email, action: 'token_refresh', req });

    return res_.success(res, { token: newToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /resetpassword ───────────────────────────────────────────
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ where: { email } });

    // Selalu 200 — tidak bocorkan apakah email terdaftar
    if (user) {
      // Hapus token lama yang belum digunakan untuk email ini
      await ResetPassword.destroy({ where: { email, usedAt: null } });

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt  = moment().tz('Asia/Jakarta').add(1, 'hour').toDate();

      await ResetPassword.create({ token: resetToken, email, expiresAt });

      // Kirim email
      try {
        const { sendResetPasswordEmail } = require('@my_module/services/emailService.js');
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendResetPasswordEmail({ to: email, resetUrl });
      } catch (mailErr) {
        // Log tapi jangan gagalkan request — token tetap dibuat
        console.error('[auth] Gagal kirim reset email:', mailErr.message);
      }
    }

    return res_.success(res, null, 'Jika email terdaftar, link reset telah dikirim');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /verifyreset ─────────────────────────────────────────────
const verifyPasswordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const record = await ResetPassword.findOne({ where: { token } });

    if (!record) {
      return res_.badRequest(res, 'Token tidak valid atau sudah kadaluarsa');
    }
    if (record.usedAt) {
      return res_.badRequest(res, 'Token sudah pernah digunakan');
    }
    if (moment().isAfter(record.expiresAt)) {
      return res_.badRequest(res, 'Token sudah kadaluarsa');
    }

    const user = await Users.findOne({ where: { email: record.email } });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');

    // Update password + tandai token sebagai sudah dipakai
    await user.update({
      password:             newPassword, // hook beforeUpdate hash otomatis
      refreshToken:         null,        // paksa logout semua sesi
      refreshTokenExpiresAt: null,
    });
    await record.update({ usedAt: new Date() });
    await invalidateUserSession(user.id);
    await activityLog.log({ userId: user.id, email: user.email, action: 'password_reset', req });

    return res_.success(res, null, 'Password berhasil direset. Silakan login');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { login, logout, refreshToken, requestPasswordReset, verifyPasswordReset };
