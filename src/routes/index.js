const express = require('express');
const AuthRoute = require('./api/AuthRoute.js')
const MailRoute = require('./api/MailRoute.js')
const authenticateToken = require('@/middleware/auth.js');

const routers = express.Router();
routers.use("/", AuthRoute);
routers.use("/mail", MailRoute);

module.exports = routers;
