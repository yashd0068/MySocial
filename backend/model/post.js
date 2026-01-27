module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define(
        "Post",
        {
            post_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            image_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "posts",
            freezeTableName: true,
            timestamps: true,
            indexes: [{ fields: ["user_id"] }],
        }
    );

    return Post;
};
