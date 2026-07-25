'use strict';

const express = require('express');
const { getSettings, getPublicSettings, updateSetting, createSetting, deleteSetting } = require('@/controllers/appSettingController.js');
const { validate } = require('@/middleware/validators/index.js');
const { body } = require('express-validator');

const router = express.Router();

const createRules = [
  body('key').notEmpty().withMessage('Key wajib diisi.').matches(/^[a-z0-9_]+$/).withMessage('Key hanya boleh huruf kecil, angka, dan underscore.'),
  body('type').optional().isIn(['string','number','boolean','json']).withMessage('Type tidak valid.'),
];
const updateRules = [
  body('value').notEmpty().withMessage('Value wajib diisi.'),
];

// Publik — tanpa auth
router.get('/public', getPublicSettings);

// Butuh auth
router.get('/',         getSettings);
router.post('/',        validate(createRules), createSetting);
router.put('/:key',     validate(updateRules), updateSetting);
router.delete('/:key',  deleteSetting);

module.exports = router;
