'use strict';

const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title:       'Backend Boilerplate API',
    version:     '1.0.0',
    description: 'Express.js + Sequelize + PostgreSQL + Redis Boilerplate',
    contact: { name: 'Developer', email: 'dev@example.com' },
  },
  servers: [
    { url: 'http://localhost:3000/api/v1', description: 'Development' },
    { url: 'https://yourdomain.com/api/v1', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data:    { },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors:  { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data:    { type: 'array' },
          meta: {
            type: 'object',
            properties: {
              totalItems:  { type: 'integer' },
              totalPages:  { type: 'integer' },
              currentPage: { type: 'integer' },
              pageSize:    { type: 'integer' },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/api/**/*.js'),
    path.join(__dirname, '../routes/api/*.js'),
  ],
};

module.exports = swaggerJSDoc(options);
