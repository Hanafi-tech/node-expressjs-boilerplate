'use strict';

const { body } = require('express-validator');

const createUserRules = [
  body('code')
    .notEmpty().withMessage('Kode user wajib diisi.')
    .isLength({ max: 50 }).withMessage('Kode maksimal 50 karakter.'),
  body('name')
    .notEmpty().withMessage('Nama wajib diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  body('email')
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
  body('roleId')
    .notEmpty().withMessage('Role wajib diisi.')
    .isInt({ min: 1 }).withMessage('roleId harus berupa angka positif.'),
  body('status')
    .optional()
    .isIn(['active', 'not-active']).withMessage('Status harus active atau not-active.'),
];

const updateUserRules = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  body('email')
    .optional()
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
  body('roleId')
    .optional()
    .isInt({ min: 1 }).withMessage('roleId harus berupa angka positif.'),
  body('status')
    .optional()
    .isIn(['active', 'not-active']).withMessage('Status harus active atau not-active.'),
];

const updateProfileRules = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  body('email')
    .optional()
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('newPassword')
    .optional()
    .isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (req.body.newPassword && value !== req.body.newPassword) {
        throw new Error('Konfirmasi password tidak cocok.');
      }
      return true;
    }),
  body('oldPassword')
    .if(body('newPassword').notEmpty())
    .notEmpty().withMessage('Password lama wajib diisi jika ingin ganti password.'),
];

module.exports = { createUserRules, updateUserRules, updateProfileRules };
