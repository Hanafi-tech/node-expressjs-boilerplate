'use strict';

const express           = require('express');
const { getList, getMyActivity } = require('@/controllers/activityLogController.js');
const requireSuperAdmin = require('@/middleware/requireSuperAdmin.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activity Log
 *   description: Riwayat aktivitas login user
 */

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Semua activity log (superadmin only)
 *     tags: [Activity Log]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 */
router.get('/',   requireSuperAdmin, getList);

/**
 * @swagger
 * /activity-logs/me:
 *   get:
 *     summary: Activity log milik user yang sedang login
 *     tags: [Activity Log]
 *     responses:
 *       200: { description: OK }
 */
router.get('/me', getMyActivity);

module.exports = router;
