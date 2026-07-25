'use strict';

const express = require('express');
const { getList, getById, create, update, remove } = require('@/controllers/positionController.js');
const { validate } = require('@/middleware/validators/index.js');
const { createPositionRules, updatePositionRules } = require('@/middleware/validators/positionValidator.js');

const router = express.Router();

router.get('/',     getList);
router.get('/:id',  getById);
router.post('/',   validate(createPositionRules), create);
router.put('/:id', validate(updatePositionRules), update);
router.delete('/:id', remove);

module.exports = router;
