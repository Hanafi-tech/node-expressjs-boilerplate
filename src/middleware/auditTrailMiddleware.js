'use strict';

const AuditTrail  = require('@/database/models/audittrailModel');
const urlWhitelist = require('./urlWhitelist.js');

const SKIP_PATHS = ['audit-trails', 'dashboard'];

// Field sensitif yang TIDAK boleh disimpan ke audit trail
const SENSITIVE_FIELDS = [
  'password', 'newPassword', 'oldPassword', 'confirmPassword',
  'token', 'secret', 'mfaSecret', 'mfaCode', 'backupCodes',
  'pass', 'refreshToken', 'accessToken',
];

const _sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return null;
  const sanitized = { ...body };
  SENSITIVE_FIELDS.forEach(field => {
    if (field in sanitized) sanitized[field] = '[REDACTED]';
  });
  return sanitized;
};

const actionMap = {
  GET:    (entity, id, valid) => valid ? `Akses detail ${entity} ID ${id}` : `Akses halaman ${entity}`,
  POST:   (entity, id, valid) => valid ? `Ambil detail ${entity} ID ${id}` : `Tambah ${entity}`,
  PUT:    (entity, id)        => `Update ${entity} ID ${id}`,
  PATCH:  (entity, id)        => `Update ${entity} ID ${id}`,
  DELETE: (entity, id)        => `Hapus ${entity} ID ${id}`,
};

const auditTrail = async (req, res, next) => {
  try {
    const urlSegments = req.path.split('/').filter(Boolean);
    const subject = urlSegments[0] || '';

    if (urlWhitelist.includes(subject)) return next();
    if (SKIP_PATHS.some(p => req.originalUrl.includes(p))) return next();

    const entityName = subject.split('?')[0];
    const id         = req.params.id || req.query.id || null;
    const isValidId  = id && !isNaN(parseInt(id));

    const mapFn      = actionMap[req.method];
    const description = mapFn ? mapFn(entityName, id, isValidId) : 'Aksi tidak diketahui';

    await AuditTrail.create({
      userId:    req.user ? req.user.id   : 0,
      userName:  req.user ? req.user.name : 'Anonymous',
      method:    req.method,
      endpoint:  req.originalUrl,
      description,
      body:      _sanitizeBody(req.body),
      query:     Object.keys(req.query).length  ? req.query  : null,
      params:    Object.keys(req.params).length ? req.params : null,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[audit] Failed to log audit trail:', error.message);
  }

  return next();
};

module.exports = auditTrail;
