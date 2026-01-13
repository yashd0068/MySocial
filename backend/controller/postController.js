const { Post, Follow, User, Like, Comment } = require("../model");
const { Op } = require("sequelize");

/* ================= CREATE POST ================= */
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Post content required" });
        }

        // image comes from multer
        const image_url = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const post = await Post.create({
            user_id: req.user.user_id,
            content,
            image_url,
        });

        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create post" });
    }
};

/* ================= FEED ================= */
// feedController.js (or wherever getFeed is)
exports.getFeed = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const page = parseInt(req.query.page) || 1; // default 1
        const limit = parseInt(req.query.limit) || 5; // posts per request
        const offset = (page - 1) * limit;

        const following = await Follow.findAll({
            where: { follower_id: user_id },
            attributes: ["following_id"],
        });

        const followingIds = following.map(f => f.following_id);
        // followingIds.push(user_id); // include myself

        const posts = await Post.findAll({
            where: { user_id: { [Op.in]: followingIds } },
            include: [
                { model: User, attributes: ["user_id", "name", "profilePic"] },
                { model: Like, as: "likes", attributes: ["user_id"] },
                {
                    model: Comment,
                    as: "comments",
                    include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }]
                }
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        const feed = posts.map(post => {
            const json = post.toJSON();
            return {
                ...json,
                likesCount: json.likes.length,
                commentsCount: json.comments.length,
                likedByMe: json.likes.some(l => l.user_id === user_id),
            };
        });

        res.json(feed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch feed" });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { post_id } = req.params;

        const post = await Post.findByPk(post_id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Only owner can delete
        if (post.user_id !== req.user.user_id)
            return res.status(403).json({ message: "Not authorized" });

        await Like.destroy({ where: { post_id } }); // optional: delete likes
        await post.destroy();

        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete post" });
    }
};

/* ================= EDIT POST ================= */
exports.editPost = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { content } = req.body;

        // Find post first
        const post = await Post.findByPk(post_id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user_id !== req.user.user_id)
            return res.status(403).json({ message: "Not authorized" });

        // Update content
        post.content = content;
        await post.save();

        // Fetch updated post with associated User and Likes
        const updatedPost = await Post.findByPk(post_id, {
            include: [
                { model: User, attributes: ["user_id", "name", "profilePic"] },
                { model: Like, as: "likes", attributes: ["user_id"] } // ✅ use alias
            ]
        });

        // Format likes count and whether current user liked it
        const json = updatedPost.toJSON();
        const result = {
            ...json,
            likesCount: json.likes.length,
            likedByMe: json.likes.some(like => like.user_id === req.user.user_id),
        };

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to edit post" });
    }
};
