// models/Notification.js
module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
        notification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.ENUM("like", "comment", "message", "follow"),
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // Foreign keys (nullable depending on type)
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        comment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        // Who receives the notification
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Who triggered it
        trigger_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    return Notification;
};