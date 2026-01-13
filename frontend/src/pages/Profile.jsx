import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import FollowersModal from "./FollowersModal";
import ChatWindow from "./ChatWindow";
import MobileBottomNav from "../components/MobileBottomNav";



const Profile = () => {
    const { user_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [modal, setModal] = useState({ open: false, type: "" });
    const [showComposer, setShowComposer] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    // Chat state
    const [chatId, setChatId] = useState(null);
    const [openChat, setOpenChat] = useState(false);

    useEffect(() => {
        api.get("/users/me").then(res => setCurrentUser(res.data));
        fetchProfile();
    }, [user_id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/profile/${user_id}`);
            setProfile({ ...res.data.user, stats: res.data.stats });
            setPosts(res.data.posts || []);

            // backend should return isFollowing
            if (res.data.isFollowing !== undefined) {
                setIsFollowing(res.data.isFollowing);
            }
        } catch (err) {
            console.error("Fetch profile error:", err.response?.data || err.message);
        }
    };
    const follow = async () => {
        try {
            await api.post(`/follow/${profile.user_id}`);
            setIsFollowing(true);
            setProfile(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    followers: prev.stats.followers + 1
                }
            }));
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    const unfollow = async () => {
        try {
            await api.delete(`/follow/${profile.user_id}`);
            setIsFollowing(false);
            setProfile(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    followers: prev.stats.followers - 1
                }
            }));
        } catch (err) {
            console.error("Unfollow error:", err);
        }
    };



    const handlePostUpdate = updatedPost => {
        setPosts(prev => prev.map(p => (p.post_id === updatedPost.post_id ? updatedPost : p)));
    };

    const handlePostDelete = post_id => {
        setPosts(prev => prev.filter(p => p.post_id !== post_id));
    };

    const uploadProfilePic = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.put("/users/profile-pic", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfile(prev => ({ ...prev, profilePic: res.data.profilePic }));
        } catch (err) {
            console.error("Upload error:", err.response?.data || err.message);
        }
    };

    // Start chat with this user
    const startChat = async () => {
        try {
            const res = await api.post("/chat", { user_id: profile.user_id });
            setChatId(res.data.chat_id);
            setOpenChat(true);
        } catch (err) {
            console.error("Start chat error:", err.response?.data || err.message);
        }
    };

    if (!profile || !currentUser) return <p className="p-8 text-gray-400">Loading profile…</p>;

    const isMyProfile = profile.user_id === currentUser.user_id;

    return (
        <>
            <Navbar mobile />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 py-10">

                    {/* PROFILE HEADER */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="flex items-center gap-5">

                            {/* PROFILE IMAGE */}
                            <div className="relative">
                                {isMyProfile ? (
                                    <label className="cursor-pointer block relative">
                                        <img
                                            src={profile.profilePic ? `http://localhost:5000${profile.profilePic}` : "https://via.placeholder.com/150"}
                                            className="h-16 w-16 rounded-full object-cover"
                                            alt="profile"
                                        />
                                        <span className="absolute bottom-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded z-10 pointer-events-auto">
                                            Edit
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={uploadProfilePic}
                                        />
                                    </label>
                                ) : (
                                    <img
                                        src={profile.profilePic ? `http://localhost:5000${profile.profilePic}` : "https://via.placeholder.com/150"}
                                        className="h-16 w-16 rounded-full object-cover"
                                        alt="profile"
                                    />
                                )}
                            </div>

                            {/* PROFILE INFO */}
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-semibold text-gray-900">{profile.name}</h1>
                                <div className="flex gap-6 text-sm text-gray-500 mt-2">
                                    <span>
                                        <strong className="text-gray-900">{profile.stats.posts}</strong> Posts
                                    </span>

                                    <span
                                        className="cursor-pointer"
                                        onClick={() => setModal({ open: true, type: "followers" })}
                                    >
                                        <strong className="text-gray-900">{profile.stats.followers}</strong> Followers
                                    </span>

                                    <span
                                        className="cursor-pointer"
                                        onClick={() => setModal({ open: true, type: "following" })}
                                    >
                                        <strong className="text-gray-900">{profile.stats.following}</strong> Following
                                    </span>
                                </div>

                                {/* MESSAGE BUTTON */}
                                {!isMyProfile && (
                                    <div className="flex gap-3 mt-3">
                                        {isFollowing ? (
                                            <button
                                                onClick={unfollow}
                                                className="px-4 py-2 rounded border text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                Following
                                            </button>
                                        ) : (
                                            <button
                                                onClick={follow}
                                                className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                                            >
                                                Follow
                                            </button>
                                        )}

                                        <button
                                            onClick={startChat}
                                            className="px-4 py-2 rounded border text-sm font-medium hover:bg-gray-100 transition"
                                        >
                                            Message
                                        </button>
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>

                    {/* POSTS */}
                    <div className="mt-8 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Posts</h2>

                        {posts.length === 0 ? (
                            <div className="bg-white border rounded-xl p-6 text-sm text-gray-500">
                                This user hasn’t posted anything yet.
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard
                                    key={post.post_id}
                                    post={post}
                                    currentUser={currentUser}
                                    onPostUpdated={handlePostUpdate}
                                    onPostDeleted={handlePostDelete}
                                />
                            ))
                        )}
                    </div>

                    {/* FOLLOWERS/FOLLOWING MODAL */}
                    {modal.open && (
                        <FollowersModal
                            userId={profile.user_id}
                            type={modal.type}
                            onClose={() => setModal({ open: false, type: "" })}
                        />
                    )}

                    {/* CHAT WINDOW MODAL */}
                    {openChat && chatId && (
                        <ChatWindow
                            chatId={chatId}
                            currentUser={currentUser}
                            onClose={() => setOpenChat(false)}
                        />
                    )}

                </div>
            </div>
            {/* MOBILE COMPOSER */}
            {showComposer && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end lg:hidden">
                    <div className="bg-white w-full rounded-t-2xl p-4">
                        <textarea
                            rows="3"
                            className="w-full resize-none focus:outline-none text-gray-800 text-sm"
                            placeholder="What's on your mind?"
                        />
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setShowComposer(false)}
                                className="text-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <MobileBottomNav
                user={currentUser}
                onCreate={() => setShowComposer(true)}
            />

        </>
    );
};

export default Profile;
