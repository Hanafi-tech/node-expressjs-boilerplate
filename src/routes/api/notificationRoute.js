'use strict';

const express = require('express');
const { getList, markAsRead, markAllAsRead, clear } = require('@/controllers/notificationController.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifikasi user
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Daftar notifikasi user yang login
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [unread] }
 *         description: Filter hanya notifikasi belum dibaca
 *     responses:
 *       200: { description: OK }
 */
router.get('/',               getList);

/**
 * @swagger
 * /notifications/mark-as-read:
 *   post:
 *     summary: Tandai notifikasi sebagai dibaca
 *     tags: [Notifications]
 *     responses:
 *       200: { description: OK }
 */
router.post('/mark-as-read',  markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.post('/clear',         clear);

module.exports = router;
