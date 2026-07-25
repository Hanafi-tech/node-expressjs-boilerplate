'use strict';

const crypto = require('crypto');

/**
 * Middleware: tambahkan unique Request ID ke setiap request.
 *
 * - Baca dari header X-Request-ID jika sudah ada (misal dari load balancer/gateway)
 * - Generate baru jika tidak ada
 * - Attach ke req.requestId dan response header X-Request-ID
 *
 * Cara pakai di controller:
 *   req.requestId  // → 'a1b2c3d4-e5f6-...'
 *
 * Cara trace di log:
 *   infoLogger.info('Processing request', { requestId: req.requestId });
 */
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

module.exports = requestId;
