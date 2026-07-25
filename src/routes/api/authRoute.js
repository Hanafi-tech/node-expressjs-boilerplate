'use strict';

const express = require('express');
const { login, logout, refreshToken, requestPasswordReset, verifyPasswordReset } = require('@/controllers/authController.js');
const { validate } = require('@/middleware/validators/index.js');
const { loginRules, resetPasswordRules, verifyResetRules, refreshTokenRules } = require('@/middleware/validators/authValidator.js');
const { checkBruteForce } = require('@/middleware/bruteForce.js');

const router = express.Router();

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
 *               mfaCode:  { type: string, description: "Kode MFA jika aktif" }
 *     responses:
 *       200:
 *         description: Login berhasil, kembalikan token
 *       400:
 *         description: Kredensial tidak valid
 *       429:
 *         description: Akun dikunci karena terlalu banyak percobaan gagal
 */
router.post('/login',         validate(loginRules), checkBruteForce, login);
router.post('/logout',                              logout);
router.post('/refreshtoken',  validate(refreshTokenRules),  refreshToken);
router.post('/resetpassword', validate(resetPasswordRules), requestPasswordReset);
router.post('/verifyreset',   validate(verifyResetRules),   verifyPasswordReset);

module.exports = router;
