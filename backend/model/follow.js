module.exports = (sequelize, DataTypes) => {
    const Follow = sequelize.define(
        "Follow",
        {
            follower_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            following_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "follows",
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ["follower_id", "following_id"],
                },
                { fields: ["follower_id"] },
                { fields: ["following_id"] }
            ],
        }
    );

    return Follow;
};
