'use strict';

const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');
const OTPAuth = require('otpauth');
const QRCode  = require('qrcode');

const Users = require('@/database/models/usersModel.js');
const res_  = require('@/lib/utils/response.js');

// ── GET /profile ──────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'name', 'email', 'roleName', 'positionName', 'status', 'mfaEnabled', 'image', 'createdAt', 'updatedAt'],
    });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');
    return res_.success(res, user);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /profile/update ───────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');

    const { name, email, oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword) {
      if (newPassword !== confirmPassword) return res_.badRequest(res, 'Konfirmasi password tidak cocok');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res_.badRequest(res, 'Password lama tidak sesuai');
      await user.update({ password: newPassword });
    }

    const updatePayload = {};
    if (name)  updatePayload.name  = name;
    if (email) updatePayload.email = email;
    if (Object.keys(updatePayload).length) await user.update(updatePayload);

    return res_.success(res, null, 'Profil berhasil diperbarui');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /profile/mfa-setup ───────────────────────────────────────
const mfaSetup = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');

    const totp = new OTPAuth.TOTP({
      issuer:    process.env.APP_NAME || 'Boilerplate',
      label:     user.email,
      algorithm: 'SHA1', digits: 6, period: 30,
      secret:    new OTPAuth.Secret({ size: 20 }),
    });

    const qrCode      = await QRCode.toDataURL(totp.toString());
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

    return res_.success(res, { secret: totp.secret.base32, qrCode, backupCodes });
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /profile/mfa-enable ───────────────────────────────────────
const enableMfa = async (req, res) => {
  try {
    const { token, secret, backupCodes } = req.body;
    if (!token || !secret) return res_.badRequest(res, 'Token dan secret wajib diisi');

    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1', digits: 6, period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    if (totp.validate({ token, window: 1 }) === null) {
      return res_.badRequest(res, 'Token MFA tidak valid');
    }

    const user = await Users.findOne({ where: { id: req.user.id } });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');

    await user.update({ mfaSecret: secret, mfaBackupCodes: backupCodes || [], mfaEnabled: true });
    return res_.success(res, null, 'MFA berhasil diaktifkan');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /profile/mfa-disable ──────────────────────────────────────
const disableMfa = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });
    if (!user) return res_.notFound(res, 'User tidak ditemukan');

    // Wajib verifikasi password sebelum disable MFA
    const { password } = req.body;
    if (!password) return res_.badRequest(res, 'Password wajib diisi untuk menonaktifkan MFA.');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res_.badRequest(res, 'Password tidak sesuai.');

    await user.update({ mfaSecret: null, mfaBackupCodes: null, mfaEnabled: false });
    return res_.success(res, null, 'MFA berhasil dinonaktifkan');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getProfile, updateProfile, mfaSetup, enableMfa, disableMfa };
