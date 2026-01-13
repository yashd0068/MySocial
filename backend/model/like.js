module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define(
        "Like",
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "user_id",
                },
            },
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Posts",
                    key: "post_id",
                },
            },
        },
        {
            tableName: "likes",
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ["user_id", "post_id"],
                },
            ],
        }
    );

    return Like;
};
