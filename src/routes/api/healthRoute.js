'use strict';

const express = require('express');
const { check } = require('@/controllers/healthController.js');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Semua service berjalan normal
 *       503:
 *         description: Satu atau lebih service bermasalah
 */
router.get('/', check);

module.exports = router;
