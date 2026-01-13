import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const PostCard = ({ post, currentUser, onPostUpdated, onPostDeleted }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);

    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState("");

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");

    const [profile, setProfile] = useState(null);

    const [showComments, setShowComments] = useState(false);


    useEffect(() => {
        setComments(post.comments || []);
    }, [post.comments]);

    const toggleLike = async () => {
        onPostUpdated({
            ...post,
            likedByMe: !post.likedByMe,
            likesCount: post.likedByMe
                ? post.likesCount - 1
                : post.likesCount + 1,
        });

        try {
            await api.post(`/posts/like/${post.post_id}`);
        } catch {
            onPostUpdated(post);
        }
    };

    const deletePost = async () => {
        if (!window.confirm("Delete this post?")) return;
        await api.delete(`/posts/${post.post_id}`);
        onPostDeleted(post.post_id);
    };



    const submitEdit = async () => {
        const res = await api.put(`/posts/${post.post_id}`, {
            content: editContent,
        });
        onPostUpdated(res.data);
        setEditing(false);
    };

    const submitEditComment = async (id) => {
        const res = await api.put(`/comments/${id}`, {
            content: editCommentText
        });

        setComments(prev =>
            prev.map(c => (c.comment_id === id ? res.data : c))
        );

        setEditingCommentId(null);
    };

    /* ---------------- COMMENTS ---------------- */

    const addComment = async () => {
        if (!commentText.trim()) return;

        const res = await api.post(`/comments/${post.post_id}`, {
            content: commentText,
        });

        setComments(prev => [...prev, res.data]);
        setCommentText("");
    };
    const deleteComment = async (id) => {
        await api.delete(`/comments/${id}`);
        setComments(prev => prev.filter(c => c.comment_id !== id));  // 🔥 removes ghost
    };


    /* ---------------- UI ---------------- */

    return (
        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3 text-wrap">

            {/* HEADER */}
            <div className="flex items-center gap-3">
                {post.User?.profilePic ? (
                    <img
                        src={`http://localhost:5000${post.User.profilePic}`}
                        alt={post.User.name}
                        className="h-9 w-9 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        {post.User?.name?.[0]}
                    </div>
                )}

                <div>
                    <Link
                        to={`/profile/${post.User?.user_id}`}
                        className="font-medium hover:underline"
                    >
                        {post.User?.name}
                    </Link>
                    <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* CONTENT */}
            {editing ? (
                <>
                    <textarea
                        className="w-full border rounded p-2"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={submitEdit} className="bg-indigo-600 text-white px-3 py-1 rounded">
                            Save
                        </button>
                        <button onClick={() => setEditing(false)} className="bg-gray-300 px-3 py-1 rounded">
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <p>{post.content}</p>
            )}

            {post.image_url && (
                <img
                    src={`http://localhost:5000${post.image_url}`}
                    className="rounded-lg w-full"
                />
            )}

            {/* ACTIONS */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">

                    {/* LIKE */}
                    <button onClick={toggleLike} className="text-sm flex items-center gap-1">
                        {post.likedByMe ? "❤️" : "🤍"} {post.likesCount}
                    </button>

                    {/* COMMENT TOGGLE */}
                    <button
                        onClick={() => setShowComments(prev => !prev)}
                        className="text-sm flex items-center gap-1 text-gray-600 hover:text-black"
                    >
                        💬 {comments.length}
                    </button>

                </div>

                {post.user_id === currentUser.user_id && (
                    <div className="space-x-3">
                        <button onClick={() => setEditing(true)} className="text-blue-500">
                            Edit
                        </button>
                        <button onClick={deletePost} className="text-red-500">
                            Delete
                        </button>
                    </div>
                )}
            </div>


            {/* COMMENTS */}
            {showComments && (
                <div className="space-y-2 border-t pt-3 text-wrap">

                    {comments.map(c => (
                        <div key={c.comment_id} className="flex justify-between text-sm">

                            {editingCommentId === c.comment_id ? (
                                <div className="flex w-full gap-2">
                                    <textarea
                                        value={editCommentText}
                                        onChange={e => setEditCommentText(e.target.value)}
                                        className="flex-1 border px-2 py-1 rounded resize-none break-words whitespace-pre-wrap"
                                    />

                                    <button
                                        onClick={() => submitEditComment(c.comment_id)}
                                        className="text-green-600 text-xs"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="text-gray-500 text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="max-w-full break-words overflow-hidden">
                                        <span className="font-semibold">{c.User.name}</span>
                                        <span className="ml-2 break-words whitespace-pre-wrap">
                                            {c.content}
                                        </span>
                                    </div>

                                    {c.user_id === currentUser.user_id && (
                                        <div className="flex gap-2 text-xs">
                                            <button
                                                onClick={() => {
                                                    setEditingCommentId(c.comment_id);
                                                    setEditCommentText(c.content);
                                                }}
                                                className="text-blue-500"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => deleteComment(c.comment_id)}
                                                className="text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    ))}

                    {/* ADD COMMENT */}
                    <div className="flex mt-2">
                        <textarea
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            rows={2}
                            className="flex-1 border px-3 py-1 rounded-l resize-none break-words whitespace-pre-wrap"
                        />

                        <button
                            onClick={addComment}
                            className="bg-indigo-600 text-white px-4 rounded-r"
                        >
                            Post
                        </button>
                    </div>

                </div>

            )}


        </div>
    );
};

export default PostCard;
