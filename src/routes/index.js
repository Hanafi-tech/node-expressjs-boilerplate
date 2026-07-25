'use strict';

const express    = require('express');
const auditTrail = require('@/middleware/auditTrailMiddleware');

const router = express.Router();
router.use(auditTrail);

// ── Auth ──────────────────────────────────────────────────────────
router.use('/', require('./api/authRoute.js'));

// ── Master Data ───────────────────────────────────────────────────
router.use('/listpermission', require('./api/listpermissionRoute.js'));
router.use('/data-roles',     require('./api/rolesRoute.js'));
router.use('/data-users',     require('./api/usersRoute.js'));
router.use('/positions',      require('./api/positionRoute.js'));

// ── Settings ──────────────────────────────────────────────────────
router.use('/profile',        require('./api/profileRoute.js'));
router.use('/mail',           require('./api/mailRoute.js'));
router.use('/settings',       require('./api/settingRoute.js'));

// ── System ────────────────────────────────────────────────────────
router.use('/audit-trails',   require('./api/auditTrailRoute.js'));
router.use('/notifications',  require('./api/notificationRoute.js'));
router.use('/activity-logs',  require('./api/activityLogRoute.js'));
router.use('/files',          require('./api/fileManagerRoute.js'));

module.exports = router;
