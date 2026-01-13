const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controller/profileController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:user_id", verifyToken, getUserProfile);

module.exports = router;
