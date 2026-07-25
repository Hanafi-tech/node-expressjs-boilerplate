'use strict';

const express = require('express');
const { getProfile, updateProfile, mfaSetup, enableMfa, disableMfa } = require('@/controllers/profileController.js');
const { validate } = require('@/middleware/validators/index.js');
const { updateProfileRules } = require('@/middleware/validators/userValidator.js');

const router = express.Router();

router.get('/',             getProfile);
router.put('/update',  validate(updateProfileRules), updateProfile);
router.post('/mfa-setup',   mfaSetup);
router.put('/mfa-enable',   enableMfa);
router.put('/mfa-disable',  disableMfa);

module.exports = router;
