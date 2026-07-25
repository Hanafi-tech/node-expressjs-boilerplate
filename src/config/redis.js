'use strict';

const { createClient } = require('redis');
const { errorLogger, infoLogger } = require('./logger.js');

let client = null;
let isReady = false;

const getClient = async () => {
  if (client && isReady) return client;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  client = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries >= 5) {
          errorLogger.error('[redis] Gagal reconnect setelah 5 percobaan. Redis dinonaktifkan.');
          return false; // hentikan reconnect
        }
        return Math.min(retries * 200, 2000); // backoff: 200ms, 400ms, ... max 2s
      },
    },
  });

  client.on('connect',     () => infoLogger.info('[redis] Connecting...'));
  client.on('ready',       () => { isReady = true;  infoLogger.info('[redis] Connected & ready.'); });
  client.on('end',         () => { isReady = false; infoLogger.info('[redis] Connection closed.'); });
  client.on('error',       (err) => { isReady = false; errorLogger.error(`[redis] Error: ${err.message}`); });
  client.on('reconnecting',() => infoLogger.info('[redis] Reconnecting...'));

  try {
    await client.connect();
  } catch (err) {
    errorLogger.error(`[redis] Gagal connect: ${err.message}. App tetap berjalan tanpa cache.`);
    isReady = false;
  }

  return client;
};

/**
 * Ambil nilai dari Redis. Return null jika Redis tidak tersedia atau key tidak ada.
 */
const get = async (key) => {
  try {
    const c = await getClient();
    if (!isReady) return null;
    return await c.get(key);
  } catch {
    return null;
  }
};

/**
 * Set nilai ke Redis dengan TTL dalam detik.
 */
const set = async (key, value, ttlSeconds = 300) => {
  try {
    const c = await getClient();
    if (!isReady) return;
    await c.set(key, value, { EX: ttlSeconds });
  } catch {
    // Redis gagal — biarkan app tetap jalan
  }
};

/**
 * Hapus satu atau lebih key dari Redis.
 */
const del = async (...keys) => {
  try {
    const c = await getClient();
    if (!isReady) return;
    await c.del(keys);
  } catch {
    // Abaikan error
  }
};

/**
 * Hapus semua key yang cocok dengan pattern (SCAN-based, aman untuk produksi).
 */
const delByPattern = async (pattern) => {
  try {
    const c = await getClient();
    if (!isReady) return;

    let cursor = 0;
    do {
      const result = await c.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await c.del(result.keys);
      }
    } while (cursor !== 0);
  } catch {
    // Abaikan error
  }
};

module.exports = { get, set, del, delByPattern, getClient };
