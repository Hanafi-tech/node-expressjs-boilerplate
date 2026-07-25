'use strict';

const { body } = require('express-validator');

const createConfigRules = [
  body('name')
    .notEmpty().withMessage('Nama konfigurasi wajib diisi.')
    .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
  body('service')
    .notEmpty().withMessage('Service wajib diisi.')
    .isIn(['smtp', 'gmail', 'sendgrid', 'other']).withMessage('Service harus smtp, gmail, sendgrid, atau other.'),
  body('host')
    .notEmpty().withMessage('Host SMTP wajib diisi.'),
  body('port')
    .optional()
    .isInt({ min: 1, max: 65535 }).withMessage('Port harus angka antara 1-65535.'),
  body('user')
    .notEmpty().withMessage('User/email pengirim wajib diisi.')
    .isEmail().withMessage('Format user harus email yang valid.'),
  body('pass')
    .notEmpty().withMessage('Password SMTP wajib diisi.'),
];

const updateConfigRules = [
  body('name').optional().isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
  body('service').optional().isIn(['smtp', 'gmail', 'sendgrid', 'other']).withMessage('Service tidak valid.'),
  body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('Port harus angka antara 1-65535.'),
  body('user').optional().isEmail().withMessage('Format user harus email yang valid.'),
];

const testSendRules = [
  body('to')
    .notEmpty().withMessage('Email penerima (to) wajib diisi.')
    .isEmail().withMessage('Format email penerima tidak valid.'),
  body('subject').optional().isLength({ max: 200 }).withMessage('Subject maksimal 200 karakter.'),
];

module.exports = { createConfigRules, updateConfigRules, testSendRules };
