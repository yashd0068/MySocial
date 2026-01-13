import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Search = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [user, setUser] = useState(null);
    const [following, setFollowing] = useState([]);

    // Fetch logged-in user
    useEffect(() => {
        const fetchUser = async () => {
            const res = await api.get("/users/me");
            setUser(res.data);
        };

        const fetchFollowing = async () => {
            const res = await api.get("/follow/following");
            setFollowing(res.data);
        };

        fetchUser();
        fetchFollowing();
    }, []);

    // Search users
    useEffect(() => {
        if (!query.trim() || !user) {
            setResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                const res = await api.get(`/users/search/${query}`);
                setResults(
                    res.data.filter(u => u.user_id !== user.user_id)
                );
            } catch {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [query, user]);

    // Follow / Unfollow handlers
    const follow = async (id) => {
        await api.post(`/follow/${id}`);
        setFollowing(prev => [...prev, id]);
    };

    const unfollow = async (id) => {
        await api.delete(`/follow/${id}`);
        setFollowing(prev => prev.filter(f => f !== id));
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <input
                className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search users"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
            />

            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map(u => (
                        <div
                            key={u.user_id}
                            className="flex justify-between items-center"
                        >
                            <Link
                                to={`/profile/${u.user_id}`}
                                className="font-medium text-gray-800"
                            >
                                {u.name}
                            </Link>

                            {following.includes(u.user_id) ? (
                                <button
                                    onClick={() => unfollow(u.user_id)}
                                    className="text-red-500 text-sm"
                                >
                                    Unfollow
                                </button>
                            ) : (
                                <button
                                    onClick={() => follow(u.user_id)}
                                    className="text-indigo-600 text-sm"
                                >
                                    Follow
                                </button>
                            )}
                        </div>
                    ))
                ) : query.trim() ? (
                    <p className="text-gray-500 text-sm">No users found</p>
                ) : null}
            </div>
        </div>
    );
};

export default Search;
