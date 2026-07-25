'use strict';

const express = require('express');
const { getList, getMyActivity } = require('@/controllers/activityLogController.js');

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
 *     summary: Semua activity log (admin)
 *     tags: [Activity Log]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: action
 *         schema: { type: string, enum: [login_success, login_failed, logout, password_reset, token_refresh] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: OK }
 */
router.get('/',   getList);

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
