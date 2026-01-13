const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
    getFollowingUsers
} = require("../controller/followController");

router.post("/:user_id", verifyToken, followUser);
router.delete("/:user_id", verifyToken, unfollowUser);

router.get("/following", verifyToken, getFollowing); // returns IDs
router.get("/followers", verifyToken, getFollowers); // returns user objects
router.get("/following/users", verifyToken, getFollowingUsers); // returns user objects

module.exports = router;
