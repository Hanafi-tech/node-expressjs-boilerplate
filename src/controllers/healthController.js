'use strict';

const db    = require('@/config/database.js');
const redis = require('@/config/redis.js');

const isProd = process.env.NODE_ENV === 'production';

// ── GET /health ───────────────────────────────────────────────────
const check = async (req, res) => {
  const start  = Date.now();
  const checks = {};

  // ── Database ──────────────────────────────────────────────────
  try {
    await db.authenticate();
    checks.database = { status: 'ok', responseMs: Date.now() - start };
  } catch (err) {
    // Di production, sembunyikan detail error DB
    checks.database = { status: 'error', message: isProd ? 'Unavailable' : err.message };
  }

  // ── Redis ─────────────────────────────────────────────────────
  const redisStart = Date.now();
  try {
    const client = await redis.getClient();
    await client.ping();
    checks.redis = { status: 'ok', responseMs: Date.now() - redisStart };
  } catch (err) {
    checks.redis = { status: 'error', message: isProd ? 'Unavailable' : err.message };
  }

  // ── Kafka ─────────────────────────────────────────────────────
  if (process.env.KAFKA_ENABLE === 'true') {
    const kafkaStart = Date.now();
    try {
      checks.kafka = { status: 'ok', responseMs: Date.now() - kafkaStart };
    } catch (err) {
      checks.kafka = { status: 'error', message: isProd ? 'Unavailable' : err.message };
    }
  }

  // ── Memory (hanya di non-production) ─────────────────────────
  if (!isProd) {
    const mem = process.memoryUsage();
    checks.memory = {
      heapUsedMB:  Math.round(mem.heapUsed  / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB:       Math.round(mem.rss       / 1024 / 1024),
    };
  }

  const hasError   = Object.values(checks).some(c => c && c.status === 'error');
  const statusCode = hasError ? 503 : 200;

  return res.status(statusCode).json({
    success:   !hasError,
    status:    hasError ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    // Informasi berikut hanya ditampilkan di non-production
    // untuk mencegah information disclosure
    ...(isProd ? {} : {
      uptime:      Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version:     process.env.npm_package_version || '1.0.0',
    }),
    checks,
  });
};

module.exports = { check };
