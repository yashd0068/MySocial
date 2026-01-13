import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

const Feed = forwardRef(({ currentUser }, ref) => {
    const [posts, setPosts] = useState([]);

    const fetchFeed = async () => {
        const res = await api.get("/posts/feed");
        setPosts(res.data);
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    useImperativeHandle(ref, () => ({
        refreshFeed: fetchFeed,
    }));

    const handlePostUpdate = updatedPost => {
        setPosts(prev =>
            prev.map(p => (p.post_id === updatedPost.post_id ? updatedPost : p))
        );
    };

    const handlePostDelete = post_id => {
        setPosts(prev => prev.filter(p => p.post_id !== post_id));
    };

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <PostCard
                    key={post.post_id}
                    post={post}
                    currentUser={currentUser}
                    onPostUpdated={handlePostUpdate}
                    onPostDeleted={handlePostDelete}
                />
            ))}
        </div>
    );
});

export default Feed;
