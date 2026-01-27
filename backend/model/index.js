const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const db = {};

db.sequelize = sequelize;

/* ================= MODELS ================= */


/* ================= BASE TABLES ================= */
db.User = require("./user")(sequelize, DataTypes);
db.Post = require("./post")(sequelize, DataTypes);
db.Chat = require("./Chat")(sequelize, DataTypes);

/* ================= DEPENDENT TABLES ================= */
db.Like = require("./like")(sequelize, DataTypes);
db.Comment = require("./Comment")(sequelize, DataTypes);
db.Follow = require("./Follow")(sequelize, DataTypes);
db.Message = require("./Message")(sequelize, DataTypes);

/* ================= OPTIONAL TABLES ================= */
db.Notification = require("./Notification")(sequelize, DataTypes);
db.DeletedMessage = require("./DeletedMessage")(sequelize, DataTypes);
db.DeletedChat = require("./DeletedChat")(sequelize, DataTypes);





/* ================= POSTS ================= */

db.User.hasMany(db.Post, { foreignKey: "user_id", constraints: false });
db.Post.belongsTo(db.User, { foreignKey: "user_id", constraints: false });

/* ================= LIKES ================= */

db.User.hasMany(db.Like, { foreignKey: "user_id", constraints: false });

db.Post.hasMany(db.Like, {
    foreignKey: "post_id",
    as: "likes",
    constraints: false,
});

db.Like.belongsTo(db.User, { foreignKey: "user_id", constraints: false });
db.Like.belongsTo(db.Post, { foreignKey: "post_id", constraints: false });

db.User.belongsToMany(db.Post, {
    through: db.Like,
    foreignKey: "user_id",
    otherKey: "post_id",
    as: "LikedPosts",
    constraints: false,
});

db.Post.belongsToMany(db.User, {
    through: db.Like,
    foreignKey: "post_id",
    otherKey: "user_id",
    as: "Likers",
    constraints: false,
});

/* ================= COMMENTS ================= */

db.User.hasMany(db.Comment, { foreignKey: "user_id", constraints: false });
db.Comment.belongsTo(db.User, { foreignKey: "user_id", constraints: false });

db.Post.hasMany(db.Comment, {
    foreignKey: "post_id",
    as: "comments",
    constraints: false,
});
db.Comment.belongsTo(db.Post, { foreignKey: "post_id", constraints: false });

/* ================= FOLLOW ================= */

db.User.belongsToMany(db.User, {
    through: db.Follow,
    as: "Following",
    foreignKey: "follower_id",
    otherKey: "following_id",
    constraints: false,
});

db.User.belongsToMany(db.User, {
    through: db.Follow,
    as: "Followers",
    foreignKey: "following_id",
    otherKey: "follower_id",
    constraints: false,
});

db.Follow.belongsTo(db.User, { foreignKey: "follower_id", as: "FollowerUser", constraints: false });
db.Follow.belongsTo(db.User, { foreignKey: "following_id", as: "FollowingUser", constraints: false });

/* ================= CHAT & MESSAGES ================= */

// Chat ↔ User through ChatUsers
db.Chat.belongsToMany(db.User, { through: "ChatUsers", as: "Participants", constraints: false });
db.User.belongsToMany(db.Chat, { through: "ChatUsers", as: "Chats", constraints: false });

db.Chat.hasMany(db.Message, { foreignKey: "chat_id", as: "Messages", constraints: false });
db.Message.belongsTo(db.Chat, { foreignKey: "chat_id", as: "Chat", constraints: false });

db.Message.belongsTo(db.User, { foreignKey: "sender_id", constraints: false });
db.User.hasMany(db.Message, { foreignKey: "sender_id", constraints: false });

/* ================= NOTIFICATIONS ================= */

db.User.hasMany(db.Notification, { foreignKey: "user_id", as: "Notifications", constraints: false });
db.Notification.belongsTo(db.User, { foreignKey: "user_id", constraints: false });

db.Notification.belongsTo(db.User, { foreignKey: "trigger_user_id", as: "TriggerUser", constraints: false });
db.Notification.belongsTo(db.Post, { foreignKey: "post_id", constraints: false });
db.Notification.belongsTo(db.Message, { foreignKey: "message_id", constraints: false });

module.exports = db;
