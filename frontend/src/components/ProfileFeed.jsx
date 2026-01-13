import { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "../components/PostCard";
import api from "../api/axios";

const ProfileFeed = ({ userId, currentUser }) => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    useEffect(() => {
        // Reset when userId changes
        setPosts([]);
        setPage(1);
        setHasMore(true);
    }, [userId]);

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/profile/${userId}/posts?page=${page}&pageSize=5`);
            if (res.data.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => [...prev, ...res.data]);
            }
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        }
    };

    useEffect(() => {
        if (hasMore) fetchPosts();
    }, [page, userId]);

    const lastPostRef = useCallback(node => {
        if (!hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore]);

    return (
        <div className="space-y-4">
            {posts.map((post, idx) => {
                // Attach the observer to the last post
                if (idx === posts.length - 1) {
                    return <PostCard ref={lastPostRef} key={post.post_id} post={post} currentUser={currentUser} />;
                }
                return <PostCard key={post.post_id} post={post} currentUser={currentUser} />;
            })}
            {!hasMore && <p className="text-gray-400 text-center">No more posts</p>}
        </div>
    );
};

export default ProfileFeed;
