const { Comment, User, Post } = require("../model");  // ← Add Post here!
const { createNotification } = require("./notificationController");

exports.addComment = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }

        // Create comment
        const comment = await Comment.create({
            post_id,
            user_id: req.user.user_id,
            content,
        });

        // Fetch full comment with author info
        const fullComment = await Comment.findByPk(comment.comment_id, {
            include: [
                { model: User, attributes: ["user_id", "name", "profilePic"] }
            ]
        });

        // Fetch post to get its owner
        const post = await Post.findByPk(post_id, {
            include: [{ model: User, attributes: ["user_id"] }]
        });

        if (!post) {
            // Rare case, but good to handle
            return res.status(404).json({ message: "Post not found" });
        }

        // Send notification only if commenter is not the post owner
        if (post.user_id !== req.user.user_id) {
            const triggerName = fullComment.User.name;
            await createNotification({
                type: "comment",
                targetUserId: post.user_id,
                triggerUserId: req.user.user_id,
                postId: post_id,
                content: `${triggerName} commented: "${content.substring(0, 60)}${content.length > 60 ? "..." : ""}"`,
            });
        }

        res.status(201).json(fullComment);
    } catch (err) {
        console.error("Add comment error:", err);
        res.status(500).json({ message: "Failed to add comment" });
    }
};

// deleteComment and editComment look correct — no changes needed
exports.deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;

        const comment = await Comment.findByPk(comment_id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.user_id !== req.user.user_id)
            return res.status(403).json({ message: "Not allowed" });

        await comment.destroy();

        res.json({ comment_id });
    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({ message: "Failed to delete comment" });
    }
};

exports.editComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;

        const comment = await Comment.findByPk(comment_id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.user_id !== req.user.user_id)
            return res.status(403).json({ message: "Not allowed" });

        comment.content = content;
        await comment.save();

        const updated = await Comment.findByPk(comment_id, {
            include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }]
        });

        res.json(updated);
    } catch (err) {
        console.error("Edit comment error:", err);
        res.status(500).json({ message: "Failed to edit comment" });
    }
};