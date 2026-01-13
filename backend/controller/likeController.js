const { Like, Post, User } = require("../model");
const { createNotification } = require("./notificationController");

exports.toggleLike = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { post_id } = req.params;


        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const existing = await Like.findOne({
            where: { user_id, post_id },
        });

        // UNLIKE
        if (existing) {
            await existing.destroy();
            return res.json({ liked: false });
        }

        // LIKE
        await Like.create({ user_id, post_id });
        if (post.user_id !== user_id) {
            const triggerUser = await User.findByPk(user_id, { attributes: ["name"] });
            await createNotification({
                type: "like",
                targetUserId: post.user_id,
                triggerUserId: user_id,
                postId: post_id,
                content: `${triggerUser.name} liked your post`,
            });
        }
        res.json({ liked: true });

    } catch (err) {
        console.error("TOGGLE LIKE ERROR:", err);
        return res.status(500).json({ message: "Failed to toggle like" });
    }
};
