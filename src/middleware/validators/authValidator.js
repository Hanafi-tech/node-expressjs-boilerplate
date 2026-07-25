'use strict';

const { body } = require('express-validator');

const loginRules = [
  body('email')
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
  body('mfaCode')
    .optional()
    .isLength({ min: 6, max: 8 }).withMessage('MFA code harus 6-8 karakter.')
    .isAlphanumeric().withMessage('MFA code hanya boleh berisi angka/huruf.'),
];

const resetPasswordRules = [
  body('email')
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
];

const verifyResetRules = [
  body('token')
    .notEmpty().withMessage('Token wajib diisi.'),
  body('newPassword')
    .notEmpty().withMessage('Password baru wajib diisi.')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
];

const refreshTokenRules = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token wajib diisi.'),
];

module.exports = { loginRules, resetPasswordRules, verifyResetRules, refreshTokenRules };
