'use strict';

const { body } = require('express-validator');

const createRoleRules = [
  body('name')
    .notEmpty().withMessage('Nama role wajib diisi.')
    .isLength({ min: 2, max: 50 }).withMessage('Nama role harus 2-50 karakter.')
    .matches(/^[a-zA-Z0-9\s\-_]+$/).withMessage('Nama role hanya boleh berisi huruf, angka, spasi, dash, underscore.'),
  body('status')
    .notEmpty().withMessage('Status wajib diisi.')
    .isIn(['active', 'inactive']).withMessage('Status harus active atau inactive.'),
  body('permissionsActions')
    .isArray({ min: 1 }).withMessage('permissionsActions wajib diisi dan minimal 1 item.')
    .custom((arr) => {
      for (const item of arr) {
        if (typeof item !== 'string' || !item.includes(' | ')) {
          throw new Error("Setiap permission harus berformat 'action | subject'.");
        }
      }
      return true;
    }),
];

const updateRoleRules = [
  body('id')
    .notEmpty().withMessage('ID role wajib diisi.')
    .isInt({ min: 1 }).withMessage('ID harus berupa angka positif.'),
  body('name')
    .notEmpty().withMessage('Nama role wajib diisi.')
    .isLength({ min: 2, max: 50 }).withMessage('Nama role harus 2-50 karakter.')
    .matches(/^[a-zA-Z0-9\s\-_]+$/).withMessage('Nama role hanya boleh berisi huruf, angka, spasi, dash, underscore.'),
  body('status')
    .notEmpty().withMessage('Status wajib diisi.')
    .isIn(['active', 'inactive']).withMessage('Status harus active atau inactive.'),
  body('permissionsActions')
    .isArray({ min: 1 }).withMessage('permissionsActions wajib diisi dan minimal 1 item.')
    .custom((arr) => {
      for (const item of arr) {
        if (typeof item !== 'string' || !item.includes(' | ')) {
          throw new Error("Setiap permission harus berformat 'action | subject'.");
        }
      }
      return true;
    }),
];

module.exports = { createRoleRules, updateRoleRules };
