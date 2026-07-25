'use strict';

const express = require('express');
const { getList, getById, create, update, remove } = require('@/controllers/rolesController.js');
const { validate } = require('@/middleware/validators/index.js');
const { createRoleRules, updateRoleRules } = require('@/middleware/validators/roleValidator.js');

const router = express.Router();

router.get('/',    getList);
router.get('/:id', getById);
router.post('/',  validate(createRoleRules), create);
router.put('/',   validate(updateRoleRules), update);
router.delete('/:id', remove);

module.exports = router;
