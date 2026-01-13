const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { addComment, deleteComment, editComment } = require("../controller/commentController");

router.post("/:post_id", verifyToken, addComment);
router.delete("/:comment_id", verifyToken, deleteComment);
router.put("/:comment_id", verifyToken, editComment);

module.exports = router;
