const { Notification, User, Post, Message } = require("../model");

exports.createNotification = async ({
    type,
    targetUserId,
    triggerUserId,
    postId = null,
    messageId = null,
    content,
}) => {
    try {
        const notification = await Notification.create({
            type,
            content,
            user_id: targetUserId,
            trigger_user_id: triggerUserId,
            post_id: postId,
            message_id: messageId,
        });

        // Optional: broadcast via socket if target user is online
        const io = global.io || null; // we'll set this later
        if (io) {
            io.to(`user_${targetUserId}`).emit("newNotification", notification);
        }

        return notification;
    } catch (err) {
        console.error("Create notification failed:", err);
        return null;
    }
};

// Get user's notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.user_id },
            include: [
                { model: User, as: "TriggerUser", attributes: ["user_id", "name", "profilePic"] },
                { model: Post, attributes: ["post_id", "content"] }, // optional
            ],
            order: [["createdAt", "DESC"]],
            limit: 20,
        });

        const unreadCount = await Notification.count({
            where: { user_id: req.user.user_id, is_read: false },
        });

        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// Mark as read (single or all)
exports.markAsRead = async (req, res) => {
    try {
        const { notification_id } = req.params;

        if (notification_id) {
            await Notification.update(
                { is_read: true },
                { where: { notification_id, user_id: req.user.user_id } }
            );
        } else {
            // Mark all
            await Notification.update(
                { is_read: true },
                { where: { user_id: req.user.user_id, is_read: false } }
            );
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark read" });
    }
};