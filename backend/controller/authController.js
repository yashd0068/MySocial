const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("../model/user")(sequelize, DataTypes);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "No credential provided" });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({ name, email });
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ CRITICAL FIX: Send JWT as COOKIE
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,      // Render = HTTPS
            sameSite: "none",  // Vercel ↔ Render
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            user: {
                email,
                name,
                picture
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(401).json({ message: "Google authentication failed" });
    }
};
