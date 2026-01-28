// src/layouts/MainLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import io from "socket.io-client";
import Navbar from "../components/Navbar"; // adjust path
import api from "../api/axios";           // adjust path

const SOCKET_URL = "https://mysocial-cqxp.onrender.com"; // move to .env later

function MainLayout() {
    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0); // for bell icon

    // Fetch current user once (only if logged in)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/users/me");
                setCurrentUser(res.data);
            } catch (err) {
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    // Socket.IO connection – only when user is logged in
    useEffect(() => {
        if (!currentUser?.user_id) return;

        const newSocket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected – joining user room");
            newSocket.emit("joinUserRoom", currentUser.user_id);
        });

        newSocket.on("newNotification", (notification) => {
            console.log("New notification received!", notification);
            setUnreadCount((prev) => prev + 1); // increase badge

            // Optional: show toast
            // toast.success(notification.content, { duration: 4000 });
        });

        setSocket(newSocket);

        // Cleanup on logout / unmount
        return () => {
            newSocket.disconnect();
            console.log("Socket disconnected");
        };
    }, [currentUser?.user_id]);

    return (
        <>
            {currentUser && (
                <Navbar
                    user={currentUser}
                    unreadCount={unreadCount}
                // you can pass socket or notifications state too if needed
                />
            )}
            <div className="min-h-screen bg-gray-50">
                <Outlet /> {/* ← all private pages render here */}
            </div>
        </>
    );
}

export default MainLayout;