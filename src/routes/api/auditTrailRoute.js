'use strict';

const express           = require('express');
const { getList }       = require('@/controllers/auditTrailController.js');
const requireSuperAdmin = require('@/middleware/requireSuperAdmin.js');

const router = express.Router();

/**
 * @swagger
 * /audit-trails:
 *   get:
 *     summary: Log semua request API (superadmin only)
 *     tags: [System]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 */
router.get('/', requireSuperAdmin, getList);

module.exports = router;
