const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getOrCreateChat, getChats, sendMessage, getMessages } = require("../controller/chatController");

router.post("/", verifyToken, getOrCreateChat); // create/get chat
router.get("/", verifyToken, getChats); // get all chats
router.post("/:chat_id/message", verifyToken, sendMessage); // send message
router.get("/:chat_id/messages", verifyToken, getMessages);

module.exports = router;
