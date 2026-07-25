'use strict';

const EmailService = require('@/database/models/emailServiceModel.js');
const { sendEmailWithConfig } = require('@/lib/services/emailService.js');
const res_ = require('@/lib/utils/response.js');

// ── GET /mail/config ──────────────────────────────────────────────
const getConfig = async (req, res) => {
  try {
    const configs = await EmailService.findAll({ order: [['id', 'ASC']] });
    // Sembunyikan password dari response
    const safe = configs.map(c => {
      const data = c.toJSON();
      data.pass = '••••••••';
      return data;
    });
    return res_.success(res, safe);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /mail/config ─────────────────────────────────────────────
const createConfig = async (req, res) => {
  try {
    const { name, service, host, port, secure, user, pass, fromName, isActive } = req.body;

    // Jika isActive = true, nonaktifkan config lain
    if (isActive) {
      await EmailService.update({ isActive: false }, { where: {} });
    }

    const config = await EmailService.create({
      name, service, host, port: port || 587,
      secure: Boolean(secure), user, pass,
      fromName: fromName || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const safe = config.toJSON();
    safe.pass = '••••••••';
    return res_.created(res, safe, 'Konfigurasi email berhasil dibuat');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /mail/config/:id ──────────────────────────────────────────
const updateConfig = async (req, res) => {
  try {
    const config = await EmailService.findByPk(req.params.id);
    if (!config) return res_.notFound(res, 'Konfigurasi tidak ditemukan');

    const { name, service, host, port, secure, user, pass, fromName, isActive } = req.body;

    // Jika diaktifkan, nonaktifkan config lain
    if (isActive) {
      await EmailService.update({ isActive: false }, { where: {} });
    }

    await config.update({
      name:     name     !== undefined ? name     : config.name,
      service:  service  !== undefined ? service  : config.service,
      host:     host     !== undefined ? host     : config.host,
      port:     port     !== undefined ? port     : config.port,
      secure:   secure   !== undefined ? Boolean(secure) : config.secure,
      user:     user     !== undefined ? user     : config.user,
      pass:     pass     !== undefined ? pass     : config.pass,
      fromName: fromName !== undefined ? fromName : config.fromName,
      isActive: isActive !== undefined ? Boolean(isActive) : config.isActive,
    });

    const safe = config.toJSON();
    safe.pass = '••••••••';
    return res_.success(res, safe, 'Konfigurasi email berhasil diperbarui');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── DELETE /mail/config/:id ───────────────────────────────────────
const deleteConfig = async (req, res) => {
  try {
    const config = await EmailService.findByPk(req.params.id);
    if (!config) return res_.notFound(res, 'Konfigurasi tidak ditemukan');
    if (config.isActive) {
      return res_.badRequest(res, 'Tidak bisa menghapus konfigurasi yang sedang aktif. Aktifkan config lain terlebih dahulu.');
    }
    await config.destroy();
    return res_.success(res, null, 'Konfigurasi email berhasil dihapus');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /mail/config/:id/activate ───────────────────────────────
const activateConfig = async (req, res) => {
  try {
    const config = await EmailService.findByPk(req.params.id);
    if (!config) return res_.notFound(res, 'Konfigurasi tidak ditemukan');

    await EmailService.update({ isActive: false }, { where: {} });
    await config.update({ isActive: true });

    return res_.success(res, null, `Konfigurasi "${config.name}" diaktifkan`);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /mail/test ───────────────────────────────────────────────
/**
 * Test kirim email menggunakan konfigurasi aktif dari DB.
 * Body: { to: string, subject?: string }
 */
const testSend = async (req, res) => {
  try {
    const { to, subject } = req.body;
    if (!to) return res_.badRequest(res, 'Email penerima (to) wajib diisi');

    // Ambil config aktif langsung dari DB (termasuk password asli)
    const config = await EmailService.findOne({ where: { isActive: true } });
    if (!config) {
      return res_.badRequest(res, 'Tidak ada konfigurasi email aktif. Buat via POST /mail/config.');
    }

    const html = `
      <div style="font-family:Arial,sans-serif;padding:30px;">
        <h2 style="color:#28a745;">✅ Email Test Berhasil!</h2>
        <p>Konfigurasi email Anda berfungsi dengan baik.</p>
        <table style="border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:4px 12px 4px 0;color:#888;">Host</td><td><strong>${config.host}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">Port</td><td><strong>${config.port}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">Secure</td><td><strong>${config.secure ? 'SSL/TLS' : 'STARTTLS'}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">User</td><td><strong>${config.user}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">Terkirim ke</td><td><strong>${to}</strong></td></tr>
        </table>
        <p style="color:#aaa;font-size:12px;margin-top:24px;">Dikirim dari Backend Boilerplate — ${new Date().toISOString()}</p>
      </div>
    `;

    await sendEmailWithConfig(config, {
      to,
      subject: subject || '✅ Test Email — Backend Boilerplate',
      html,
    });

    return res_.success(res, { to, config: config.name }, 'Email test berhasil dikirim');
  } catch (err) {
    return res_.serverError(res, `Gagal mengirim email: ${err.message}`);
  }
};

module.exports = { getConfig, createConfig, updateConfig, deleteConfig, activateConfig, testSend };
