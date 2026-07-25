'use strict';

const express = require('express');
const { getList } = require('@/controllers/auditTrailController.js');

const router = express.Router();

router.get('/', getList);

module.exports = router;
