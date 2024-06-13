const express = require("express");
const mail = require("@/controllers/MailTestController.js");

const router = express.Router();
router.post("/", mail.testMailService);

module.exports = router;
