const jwt = require("jsonwebtoken");
const { User, Post, Follow, Like } = require("../model");
const { Op } = require("sequelize");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        const existing = await User.findOne({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            authType: "local",
        });

        const token = jwt.sign(
            { user_id: newUser.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordSet) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const match = await user.validPassword(password);

        if (!match) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Error logging in" });
    }
};

/* ================= GET ME ================= */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: ["user_id", "name", "email", "profilePic"],
        });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

/* ================= SEARCH USERS ================= */
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.params;

        const users = await User.findAll({
            where: {
                name: { [Op.like]: `%${query}%` },
            },
            attributes: ["user_id", "name", "profilePic"],
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Search failed" });
    }
};

/* ================= USER PROFILE ================= */
exports.getUserProfile = async (req, res) => {
    try {
        const profile_user_id = req.params.user_id;
        const current_user_id = req.user.user_id;

        // USER
        const user = await User.findByPk(profile_user_id, {
            attributes: ["user_id", "name", "profilePic"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // STATS
        const [postsCount, followersCount, followingCount] = await Promise.all([
            Post.count({ where: { user_id: profile_user_id } }),
            Follow.count({ where: { following_id: profile_user_id } }),
            Follow.count({ where: { follower_id: profile_user_id } }),
        ]);

        // POSTS
        const posts = await Post.findAll({
            where: { user_id: profile_user_id },
            include: [
                { model: User, attributes: ["user_id", "name", "profilePic"] },
                { model: Like, as: "likes", attributes: ["user_id"] },
                {
                    model: Comment,
                    as: "comments",
                    include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }]
                }
            ],
            order: [["createdAt", "DESC"]],
        });


        const formattedPosts = posts.map(post => {
            const json = post.toJSON();
            return {
                ...json,
                likesCount: json.likes.length,
                commentsCount: json.comments.length,
                likedByMe: json.likes.some(l => l.user_id === current_user_id),
            };
        });


        res.json({
            user,
            stats: {
                posts: postsCount,
                followers: followersCount,
                following: followingCount,
            },
            posts: formattedPosts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load profile" });
    }
};

/* ================= UPLOAD PROFILE PIC ================= */
exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        await User.update(
            { profilePic: imageUrl },
            { where: { user_id: req.user.user_id } }
        );

        res.json({
            message: "Profile picture updated",
            profilePic: imageUrl
        });
    } catch (err) {
        console.error("UPLOAD ERROR:", err);
        res.status(500).json({ message: "Upload failed" });
    }
};


