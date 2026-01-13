const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getNotifications } = require("../controller/notificationController");

router.get("/", verifyToken, getNotifications);

module.exports = router;