'use strict';

const express = require('express');
const { getSettings, getPublicSettings, updateSetting, createSetting, deleteSetting } = require('@/controllers/appSettingController.js');
const { validate } = require('@/middleware/validators/index.js');
const { body }     = require('express-validator');
const requireSuperAdmin = require('@/middleware/requireSuperAdmin.js');

const router = express.Router();

const createRules = [
  body('key').notEmpty().withMessage('Key wajib diisi.')
    .matches(/^[a-z0-9_]+$/).withMessage('Key hanya boleh huruf kecil, angka, dan underscore.'),
  body('type').optional().isIn(['string','number','boolean','json']).withMessage('Type tidak valid.'),
];
const updateRules = [
  body('value').notEmpty().withMessage('Value wajib diisi.'),
];

// Semua endpoint settings membutuhkan auth — route /public dipasang di app.js (sebelum auth middleware)
router.get('/',         requireSuperAdmin, getSettings);
router.post('/',        requireSuperAdmin, validate(createRules), createSetting);
router.put('/:key',     requireSuperAdmin, validate(updateRules), updateSetting);
router.delete('/:key',  requireSuperAdmin, deleteSetting);

// /settings/public diekspos terpisah di app.js tanpa auth
// Lihat: app.use('/api/v1/settings/public', ...) di app.js
module.exports = router;

// Export juga handler public untuk dipasang di app.js
module.exports.getPublicSettings = getPublicSettings;
