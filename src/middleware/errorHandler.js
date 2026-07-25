'use strict';

const { errorLogger, warnLogger } = require('@/config/logger');

const handle404Error = (req, res, _next) => {
  const message = `[${req.method}] ${req.originalUrl} — Route tidak ditemukan`;
  warnLogger.warn({ message, metadata: { method: req.method, url: req.originalUrl, status: 404 } });
  return res.status(404).json({ success: false, message });
};

const handleOtherErrors = (err, req, res, _next) => {
  const status  = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  errorLogger.error({
    message: `[${req.method}] ${req.originalUrl} ${status} — ${message}`,
    metadata: { stack: err.stack || 'No stack trace', method: req.method, url: req.originalUrl, status },
  });

  return res.status(status).json({ success: false, message });
};

module.exports = { handle404Error, handleOtherErrors };
