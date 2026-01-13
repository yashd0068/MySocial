const express = require("express");
const router = express.Router();
const { toggleLike } = require("../controller/likeController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/:post_id", verifyToken, toggleLike);

module.exports = router;
