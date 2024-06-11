const express = require('express');
const AuthRoute = require('./api/AuthRoute.js')
const authenticateToken = require('@/middleware/auth.js');

const routers = express.Router();
routers.use("/", AuthRoute);

module.exports = routers;
