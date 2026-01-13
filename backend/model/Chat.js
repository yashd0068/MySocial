module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define("Chat", {
        chat_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
    });
    return Chat;
};
