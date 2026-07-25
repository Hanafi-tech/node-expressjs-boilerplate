'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware runner: jalankan array rules validasi lalu cek hasilnya.
 * Jika ada error, langsung return 422 dengan detail per field.
 *
 * Penggunaan di route:
 *   router.post('/', validate(loginRules), controller.Login);
 */
const validate = (rules) => {
  return async (req, res, next) => {
    // Jalankan semua rules
    await Promise.all(rules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  };
};

module.exports = { validate };
