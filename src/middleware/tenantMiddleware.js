'use strict';

/**
 * Placeholder middleware — SaaS multi-tenant telah dihapus dari boilerplate ini.
 *
 * File ini dipertahankan agar import di routes/index.js tetap valid.
 * Semua fungsi di sini hanya pass-through (next()).
 *
 * Jika Anda ingin menambahkan multi-tenancy di masa depan,
 * implementasikan logika di sini.
 */

const resolveTenant = (req, res, next) => next();

const requireActiveSubscription = (req, res, next) => next();

const injectTenantScope = (req, res, next) => next();

const requireFeature = (_featureKey) => (_req, _res, next) => next();

const requireSuperAdmin = (req, res, next) => {
  // Gunakan positionName sebagai fallback sederhana
  const position = (req.user && req.user.positionName || '').toLowerCase();
  if (position === 'superadmin') return next();
  return res.status(403).json({ msg: 'Akses ditolak. Hanya Super Admin yang diizinkan.' });
};

module.exports = {
  resolveTenant,
  requireActiveSubscription,
  injectTenantScope,
  requireFeature,
  requireSuperAdmin,
};
