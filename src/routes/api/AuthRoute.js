const express = require("express");
const Auth = require("@/controllers/AuthController.js");

const router = express.Router();
router.post("/login", Auth.Login);
router.post("/logout", Auth.Logout);
router.post('/resetpassword', Auth.ResetPassword);
router.post('/refreshtoken', Auth.refreshToken);

module.exports = router;
