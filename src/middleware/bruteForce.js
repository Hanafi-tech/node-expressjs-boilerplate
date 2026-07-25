'use strict';

const redis = require('@/config/redis.js');

const MAX_ATTEMPTS  = parseInt(process.env.LOGIN_MAX_ATTEMPTS   || '5',    10);
const WINDOW_SEC    = parseInt(process.env.LOGIN_WINDOW_SECONDS || '900',  10); // 15 menit
const LOCKOUT_SEC   = parseInt(process.env.LOGIN_LOCKOUT_SECONDS|| '1800', 10); // 30 menit

const keyAttempts = (email) => `brute:attempts:${email}`;
const keyLockout  = (email) => `brute:lockout:${email}`;

/**
 * Middleware: cek apakah email sedang di-lockout.
 * Pasang SEBELUM proses validasi password di route login.
 */
const checkBruteForce = async (req, res, next) => {
  const email = (req.body.email || '').toLowerCase().trim();
  if (!email) return next();

  try {
    const isLocked = await redis.get(keyLockout(email));
    if (isLocked) {
      const ttl = await redis.getClient().then(c => c.ttl(keyLockout(email)));
      return res.status(429).json({
        success: false,
        message: `Akun sementara dikunci karena terlalu banyak percobaan login gagal. Coba lagi dalam ${Math.ceil(ttl / 60)} menit.`,
        retryAfterSeconds: ttl,
      });
    }
  } catch {
    // Redis tidak tersedia — biarkan lanjut
  }

  return next();
};

/**
 * Catat percobaan login gagal untuk email tertentu.
 * Panggil ini dari authController setelah password salah.
 */
const recordFailedAttempt = async (email) => {
  const key = keyAttempts(email.toLowerCase().trim());
  try {
    const attempts = await redis.get(key);
    const count    = attempts ? parseInt(attempts) + 1 : 1;

    await redis.set(key, String(count), WINDOW_SEC);

    if (count >= MAX_ATTEMPTS) {
      await redis.set(keyLockout(email.toLowerCase().trim()), '1', LOCKOUT_SEC);
      await redis.del(key);
    }

    return { count, locked: count >= MAX_ATTEMPTS };
  } catch {
    return { count: 0, locked: false };
  }
};

/**
 * Reset counter setelah login sukses.
 */
const resetAttempts = async (email) => {
  try {
    await redis.del(keyAttempts(email.toLowerCase().trim()));
    await redis.del(keyLockout(email.toLowerCase().trim()));
  } catch {
    // Abaikan error Redis
  }
};

/**
 * Cek sisa percobaan untuk email (untuk info ke client).
 */
const getRemainingAttempts = async (email) => {
  try {
    const attempts = await redis.get(keyAttempts(email.toLowerCase().trim()));
    return Math.max(0, MAX_ATTEMPTS - (attempts ? parseInt(attempts) : 0));
  } catch {
    return MAX_ATTEMPTS;
  }
};

module.exports = { checkBruteForce, recordFailedAttempt, resetAttempts, getRemainingAttempts };
