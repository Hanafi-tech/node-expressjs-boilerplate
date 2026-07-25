'use strict';

const express = require('express');
const { getConfig, createConfig, updateConfig, deleteConfig, activateConfig, testSend } = require('@/controllers/mailController.js');
const { validate } = require('@/middleware/validators/index.js');
const { createConfigRules, updateConfigRules, testSendRules } = require('@/middleware/validators/mailValidator.js');

const router = express.Router();

// ── Konfigurasi SMTP ──────────────────────────────────────────────
router.get('/config',                 getConfig);
router.post('/config',   validate(createConfigRules), createConfig);
router.put('/config/:id', validate(updateConfigRules), updateConfig);
router.delete('/config/:id',          deleteConfig);
router.post('/config/:id/activate',   activateConfig);

// ── Test kirim email ──────────────────────────────────────────────
router.post('/test', validate(testSendRules), testSend);

module.exports = router;
