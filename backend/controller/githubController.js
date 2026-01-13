const axios = require("axios");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("../model/user")(sequelize, DataTypes);

exports.githubAuth = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: "No code provided" });
        }

        const tokenRes = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenRes.data.access_token;


        const { data: githubUser } = await axios.get(
            "https://api.github.com/user",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );


        const { data: emails } = await axios.get(
            "https://api.github.com/user/emails",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const primaryEmail =
            emails.find(e => e.primary && e.verified)?.email || null;

        let user = await User.findOne({
            where: primaryEmail ? { email: primaryEmail } : { github_id: githubUser.id }
        });

        if (!user) {
            user = await User.create({
                name: githubUser.name || githubUser.login,
                email: primaryEmail,
                github_id: githubUser.id,
            });
        } else if (!user.github_id) { // user exixt but no git id then 
            user.github_id = githubUser.id;
            await user.save();
        }


        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                email: user.email,
                name: user.name,
            },
        });

    } catch (err) {
        console.error("GitHub Auth Error:", err);
        res.status(401).json({ message: "GitHub authentication failed" });
    }
};
