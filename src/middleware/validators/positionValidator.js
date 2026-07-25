'use strict';

const { body } = require('express-validator');

const createPositionRules = [
  body('name')
    .notEmpty().withMessage('Nama jabatan wajib diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama jabatan harus 2-100 karakter.'),
  body('status')
    .optional()
    .isIn(['active', 'not-active']).withMessage('Status harus active atau not-active.'),
];

const updatePositionRules = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Nama jabatan harus 2-100 karakter.'),
  body('status')
    .optional()
    .isIn(['active', 'not-active']).withMessage('Status harus active atau not-active.'),
];

module.exports = { createPositionRules, updatePositionRules };
