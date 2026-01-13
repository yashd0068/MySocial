import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const ChatWindow = ({ chatId, currentUser, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null); // for auto - scrolling
    const socketRef = useRef(null); // we used it for Stores socket connection and Persists across renders

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, { //Cnnct frontend to Socket.IO backend
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.emit("joinChat", chatId); // show current user joined tge4  chat 

        socketRef.current.on("receiveMessage", (incomingMessage) => {
            if (incomingMessage.sender_id !== currentUser.user_id) {
                setMessages((prev) => [...prev, incomingMessage]);
            }
        });

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${chatId}/messages`);
                setMessages(res.data || []);
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };

        fetchMessages();

        return () => {
            if (socketRef.current) {
                socketRef.current.emit("leaveChat", chatId);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatId, currentUser.user_id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        const optimisticMessage = {
            message_id: Date.now(),
            content: trimmed,
            sender_id: currentUser.user_id,
            User: {
                name: "You",
            },
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage("");

        try {
            const res = await api.post(`/chat/${chatId}/message`, {
                content: trimmed,
            });

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.message_id === optimisticMessage.message_id ? res.data : msg
                )
            );
        } catch (err) {
            console.error("Send failed:", err);
            setMessages((prev) =>
                prev.filter((m) => m.message_id !== optimisticMessage.message_id)
            );
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div
            className="
                fixed inset-0 
                md:inset-auto md:bottom-8 md:right-8 
                w-full h-full 
                md:w-80 lg:w-96 md:h-[500px]
                bg-white border md:rounded-lg shadow-2xl 
                flex flex-col z-50
            "
        >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10">
                <span className="font-semibold text-gray-900">Chat</span>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    ×
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 overscroll-contain">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.user_id;

                        return (
                            <div
                                key={msg.message_id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                {!isMe && (
                                    <span className="text-xs text-gray-500 mb-1 pl-2">
                                        {msg.User?.name || "User"}
                                    </span>
                                )}

                                <div
                                    className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl shadow-sm ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-white text-gray-900 rounded-bl-none border"
                                        }`}
                                >
                                    <div className="text-sm break-words">
                                        {msg.content}
                                    </div>

                                    <div
                                        className={`text-xs mt-1 opacity-70 ${isMe
                                            ? "text-indigo-100"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        {new Date(msg.createdAt).toLocaleTimeString(
                                            [],
                                            { hour: "2-digit", minute: "2-digit" }
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 bg-white sticky bottom-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="
                            flex-1 px-4 py-3 
                            border rounded-full 
                            focus:outline-none focus:ring-2 focus:ring-indigo-500
                            text-base
                        "
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="
                            bg-indigo-600 text-white 
                            px-5 py-3 rounded-full 
                            hover:bg-indigo-700 transition
                            disabled:bg-indigo-300 disabled:cursor-not-allowed
                            text-base
                        "
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
