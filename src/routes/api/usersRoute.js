'use strict';

const express = require('express');
const { getList, getById, getAdditionalData, create, update, remove } = require('@/controllers/usersController.js');
const { validate } = require('@/middleware/validators/index.js');
const { createUserRules, updateUserRules } = require('@/middleware/validators/userValidator.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen user
 */

/**
 * @swagger
 * /data-users:
 *   get:
 *     summary: Daftar user (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, not-active, all] }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
 */
router.get('/',                getList);
router.get('/additional-data', getAdditionalData);

/**
 * @swagger
 * /data-users/{id}:
 *   get:
 *     summary: Detail user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id',             getById);

/**
 * @swagger
 * /data-users:
 *   post:
 *     summary: Buat user baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, email, password, roleId]
 *             properties:
 *               code:     { type: string }
 *               name:     { type: string }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               roleId:   { type: integer }
 *               positionId: { type: integer }
 *               status:   { type: string, enum: [active, not-active] }
 *     responses:
 *       201: { description: Created }
 *       422: { description: Validation error }
 */
router.post('/',   validate(createUserRules), create);
router.put('/',    validate(updateUserRules), update);
router.delete('/:id', remove);

module.exports = router;
