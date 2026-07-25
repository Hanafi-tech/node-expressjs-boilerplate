'use strict';

const AppSetting = require('@/database/models/appSettingModel.js');
const redis      = require('@/config/redis.js');

const CACHE_KEY = 'app:settings';
const CACHE_TTL = 60 * 5; // 5 menit

// ── Parse value sesuai type ───────────────────────────────────────
const _parse = (value, type) => {
  if (value === null || value === undefined) return null;
  switch (type) {
    case 'number':  return Number(value);
    case 'boolean': return value === 'true' || value === true;
    case 'json':    try { return JSON.parse(value); } catch { return value; }
    default:        return value;
  }
};

// ── Ambil semua settings sebagai flat object { key: parsedValue } ─
const getAll = async () => {
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* lanjut ke DB */ }
  }

  const rows    = await AppSetting.findAll();
  const settings = {};
  rows.forEach(row => { settings[row.key] = _parse(row.value, row.type); });

  await redis.set(CACHE_KEY, JSON.stringify(settings), CACHE_TTL);
  return settings;
};

// ── Ambil satu setting by key ─────────────────────────────────────
const get = async (key, defaultValue = null) => {
  const all = await getAll();
  return key in all ? all[key] : defaultValue;
};

// ── Invalidasi cache setelah update ──────────────────────────────
const invalidate = async () => {
  await redis.del(CACHE_KEY);
};

module.exports = { getAll, get, invalidate };
