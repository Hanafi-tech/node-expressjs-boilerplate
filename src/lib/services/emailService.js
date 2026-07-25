'use strict';

const nodemailer    = require('nodemailer');
const EmailService  = require('@/database/models/emailServiceModel.js');

// ── Private: buat transporter dari object config ──────────────────
const _createTransporter = (config) => {
  return nodemailer.createTransport({
    host:   config.host,
    port:   Number(config.port),
    secure: Boolean(config.secure),
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

// ── Ambil config aktif dari DB ────────────────────────────────────
/**
 * Ambil konfigurasi email aktif dari tabel email_services.
 * Throw error jika tidak ditemukan.
 * @returns {Promise<object>} config { host, port, secure, user, pass, fromName }
 */
const getActiveConfig = async () => {
  const config = await EmailService.findOne({ where: { isActive: true } });
  if (!config) {
    throw new Error('Konfigurasi email aktif tidak ditemukan. Tambahkan via API POST /mail/config.');
  }
  return config;
};

// ─────────────────────────────────────────────────────────────────
// 1. Kirim email dengan config manual (untuk testing / override)
// ─────────────────────────────────────────────────────────────────
/**
 * @param {{ host, port, secure, user, pass, fromName? }} config
 * @param {{ to, subject, html, from? }} mail
 */
const sendEmailWithConfig = async (config, { to, subject, html, from }) => {
  const transporter = _createTransporter(config);
  return transporter.sendMail({
    from:    from || `"${config.fromName || 'No Reply'}" <${config.user}>`,
    to,
    subject,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────
// 2. Kirim email — config otomatis diambil dari DB
// ─────────────────────────────────────────────────────────────────
/**
 * @param {{ to, subject, html, from? }} mail
 */
const sendEmail = async ({ to, subject, html, from }) => {
  const config = await getActiveConfig();
  return sendEmailWithConfig(config, { to, subject, html, from });
};

// ─────────────────────────────────────────────────────────────────
// 3. Template: Reset Password
// ─────────────────────────────────────────────────────────────────
/**
 * @param {{ to: string, resetUrl: string, appName?: string }} options
 */
const sendResetPasswordEmail = async ({ to, resetUrl, appName }) => {
  const config  = await getActiveConfig();
  const name    = appName || config.fromName || 'Boilerplate';

  const html = `
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Reset Password</title></head>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:40px;box-shadow:0 0 10px rgba(0,0,0,.1);">
        <h2 style="color:#333;">Reset Password</h2>
        <p style="color:#555;">Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
        <p style="color:#555;">Klik tombol di bawah (berlaku <strong>1 jam</strong>):</p>
        <a href="${resetUrl}"
          style="display:inline-block;padding:12px 28px;background:#007bff;color:#fff;
                 text-decoration:none;border-radius:4px;margin:20px 0;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px;">
          Jika tidak merasa meminta reset password, abaikan email ini.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="color:#aaa;font-size:11px;">&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
      </div>
    </body></html>
  `;

  return sendEmailWithConfig(config, {
    to,
    subject: `[${name}] Reset Password`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────
// 4. Template: Verifikasi Email
// ─────────────────────────────────────────────────────────────────
/**
 * @param {{ to: string, verifyUrl: string, appName?: string }} options
 */
const sendVerificationEmail = async ({ to, verifyUrl, appName }) => {
  const config = await getActiveConfig();
  const name   = appName || config.fromName || 'Boilerplate';

  const html = `
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Verifikasi Email</title></head>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:40px;box-shadow:0 0 10px rgba(0,0,0,.1);">
        <h2 style="color:#333;">Verifikasi Email Anda</h2>
        <p style="color:#555;">Klik tombol di bawah untuk memverifikasi alamat email Anda:</p>
        <a href="${verifyUrl}"
          style="display:inline-block;padding:12px 28px;background:#28a745;color:#fff;
                 text-decoration:none;border-radius:4px;margin:20px 0;font-weight:bold;">
          Verifikasi Email
        </a>
        <p style="color:#888;font-size:13px;">
          Jika tidak merasa mendaftar, abaikan email ini.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="color:#aaa;font-size:11px;">&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
      </div>
    </body></html>
  `;

  return sendEmailWithConfig(config, {
    to,
    subject: `[${name}] Verifikasi Email`,
    html,
  });
};

module.exports = {
  getActiveConfig,
  sendEmail,
  sendEmailWithConfig,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
