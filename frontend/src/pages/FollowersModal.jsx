// FollowersModal.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

const FollowersModal = ({ userId, type, onClose }) => {
    // type = "followers" | "following"
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            let url = "";
            if (type === "followers") {
                url = `/follow/followers?user_id=${userId}`;
            } else if (type === "following") {
                url = `/follow/following/users?user_id=${userId}`;
            }

            const res = await api.get(url);
            setUsers(res.data);
        };
        fetchUsers();
    }, [type, userId]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
            <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold capitalize">{type}</h2>
                    <button onClick={onClose} className="text-red-500 font-bold">X</button>
                </div>
                <div className="space-y-3">
                    {users.length ? (
                        users.map(u => (
                            <div key={u.user_id} className="flex items-center gap-3">
                                <img
                                    src={u.profilePic ? `http://mysocial-cqxp.onrender.com${u.profilePic}` : "/default-profile.png"}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span>{u.name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No users found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowersModal;
