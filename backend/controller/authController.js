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
        const { email, name, picture, sub: googleId } = payload;


        let token = null // WE STORE JWT TOKEN IN IT LATER

        const existing = await User.findOne({ where: { email } });
        if (existing) {

            token = jwt.sign(
                { user_id: existing.user_id, email: existing.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
        }

        else {
            const newUser = await User.create({ name, email });
            token = jwt.sign(
                { user_id: newUser.user_id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
        }

        return res.status(200).json({ success: true, token, user: { email, name, picture } });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Google authentication failed" });
    }
};
