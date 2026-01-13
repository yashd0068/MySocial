const { Follow, User } = require("../model");


exports.followUser = async (req, res) => {
    try {
        const follower_id = req.user.user_id;
        const following_id = parseInt(req.params.user_id);

        if (follower_id === following_id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const [follow, created] = await Follow.findOrCreate({
            where: { follower_id, following_id },
        });

        res.json({
            message: created ? "User followed" : "Already following",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to follow user" });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const deleted = await Follow.destroy({
            where: {
                follower_id: req.user.user_id,
                following_id: parseInt(req.params.user_id),
            },
        });

        if (deleted) {
            res.json({ message: "User unfollowed" });
        } else {
            res.status(400).json({ message: "You were not following this user" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to unfollow user" });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const following = await Follow.findAll({
            where: { follower_id: req.user.user_id },
            attributes: ["following_id"],
        });

        res.json(following.map(f => f.following_id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch following list" });
    }
};



// Get followers of a user
exports.getFollowers = async (req, res) => {
    try {
        const user_id = parseInt(req.query.user_id);
        if (!user_id) return res.status(400).json({ message: "user_id is required" });

        const followers = await Follow.findAll({
            where: { following_id: user_id },
            include: [
                { model: User, as: "FollowerUser", attributes: ["user_id", "name", "profilePic"] }
            ],
        });

        // Send only the user objects
        res.json(followers.map(f => f.FollowerUser));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch followers" });
    }
};

// Get following of a user
exports.getFollowingUsers = async (req, res) => {
    try {
        const user_id = parseInt(req.query.user_id);
        if (!user_id) return res.status(400).json({ message: "user_id is required" });

        const following = await Follow.findAll({
            where: { follower_id: user_id },
            include: [
                { model: User, as: "FollowingUser", attributes: ["user_id", "name", "profilePic"] }
            ],
        });

        res.json(following.map(f => f.FollowingUser));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch following" });
    }
};
