'use strict';

const express    = require('express');
const rateLimit  = require('express-rate-limit');
const { login, logout, refreshToken, requestPasswordReset, verifyPasswordReset } = require('@/controllers/authController.js');
const { validate } = require('@/middleware/validators/index.js');
const { loginRules, resetPasswordRules, verifyResetRules, refreshTokenRules } = require('@/middleware/validators/authValidator.js');
const { checkBruteForce } = require('@/middleware/bruteForce.js');

const router = express.Router();

// Rate limit khusus per endpoint auth — lebih ketat dari global
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20,
  message: { success: false, message: 'Terlalu banyak percobaan. Coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: false,
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5,
  message: { success: false, message: 'Terlalu banyak permintaan reset password. Coba lagi setelah 1 jam.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi & manajemen token
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               mfaCode:  { type: string }
 *     responses:
 *       200: { description: Login berhasil }
 *       400: { description: Kredensial tidak valid }
 *       429: { description: Terlalu banyak percobaan / akun dikunci }
 */
router.post('/login',         authLimiter,  validate(loginRules),         checkBruteForce, login);
router.post('/logout',                                                     logout);
router.post('/refreshtoken',  authLimiter,  validate(refreshTokenRules),  refreshToken);
router.post('/resetpassword', resetLimiter, validate(resetPasswordRules), requestPasswordReset);
router.post('/verifyreset',   resetLimiter, validate(verifyResetRules),   verifyPasswordReset);

module.exports = router;
