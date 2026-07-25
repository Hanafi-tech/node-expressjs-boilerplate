'use strict';

const express = require('express');
const { getList } = require('@/controllers/listpermissionController.js');

const router = express.Router();

router.get('/', getList);

module.exports = router;
