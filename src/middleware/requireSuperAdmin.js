'use strict';

/**
 * Middleware: hanya user dengan positionName 'superadmin' yang boleh akses.
 * Pasang di route yang bersifat administratif (audit trail, activity log semua user, dll).
 */
const requireSuperAdmin = (req, res, next) => {
  const position = (req.user?.positionName || '').toLowerCase();
  if (position === 'superadmin') return next();
  return res.status(403).json({
    success: false,
    message: 'Akses ditolak. Hanya Super Admin yang diizinkan.',
  });
};

module.exports = requireSuperAdmin;
