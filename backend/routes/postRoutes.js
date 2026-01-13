const express = require("express");
const router = express.Router();

const { createPost, getFeed, deletePost, editPost } = require("../controller/postController");
const { toggleLike } = require("../controller/likeController");

const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");


router.post(
    "/",
    verifyToken,
    upload.single("image"),
    createPost
);

router.delete("/:post_id", verifyToken, deletePost);
router.put("/:post_id", verifyToken, editPost);

// FEED
router.get("/feed", verifyToken, getFeed);

// LIKE
router.post("/like/:post_id", verifyToken, toggleLike);

module.exports = router;
