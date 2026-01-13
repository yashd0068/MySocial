const { Chat, Message, User } = require("../model");
const { createNotification } = require("./notificationController");

// Create or get one-to-one chat
exports.getOrCreateChat = async (req, res) => {
    try {
        const userIds = [req.user.user_id, parseInt(req.body.user_id)].sort();

        let chat = await Chat.findOne({   ///check is cht already exsi 
            include: [{
                model: User,
                where: { user_id: userIds }
            }],
        });

        if (!chat) {
            chat = await Chat.create();  /// no chat found , create new chat and chat id ..
            await chat.addUsers(userIds);
        }

        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create/get chat" });
    }
};

// Get all chats for a user
exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.findAll({
            include: [
                {
                    model: User,
                    attributes: ["user_id", "name", "profilePic"]
                },
                {
                    model: Message,
                    include: [{ model: User, attributes: ["user_id", "name"] }]
                }
            ],
            where: {}, // all chats user is in
        });

        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch chats" });
    }
};

// Send message
exports.getMessages = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const userId = req.user.user_id;


        const chat = await Chat.findByPk(chat_id, {
            include: [{ model: User, attributes: ["user_id"] }],
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const isParticipant = chat.Users.some(u => u.user_id === userId); // check logged in user belongs to this chat 
        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized to view this chat" });
        }

        const messages = await Message.findAll({
            where: { chat_id },
            include: [
                {
                    model: User,
                    attributes: ["user_id", "name", "profilePic"],
                },
            ],
            order: [["createdAt", "ASC"]], // oldest first
        });

        res.json(messages);
    } catch (err) {
        console.error("Get messages error:", err);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// Send message + broadcast via socket
exports.sendMessage = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const { content } = req.body;
        const sender_id = req.user.user_id;

        // O verify user belongs to chat (same as above)
        const chat = await Chat.findByPk(chat_id, {
            include: [{ model: User, attributes: ["user_id"] }],
        });
        if (!chat || !chat.Users.some(u => u.user_id === sender_id)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const message = await Message.create({
            chat_id,
            content,
            sender_id,
        });

        const fullMessage = await Message.findByPk(message.message_id, {
            include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }],
        });
        const otherUsers = chat.Users.filter(u => u.user_id !== sender_id);
        if (otherUsers.length > 0) {
            const receiverId = otherUsers[0].user_id;
            const senderName = fullMessage.User.name;

            await createNotification({
                type: "message",
                targetUserId: receiverId,
                triggerUserId: sender_id,
                messageId: message.message_id,
                content: `${senderName} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
            });
        }

        // VERY IMPORTANT: Broadcast to everyone in the chat room
        const io = req.app.get("io"); // ← we set this in app.js
        io.to(chat_id.toString()).emit("receiveMessage", fullMessage.toJSON());

        res.json(fullMessage);
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ message: "Failed to send message" });
    }
};