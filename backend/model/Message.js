module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        message_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        content: { type: DataTypes.TEXT, allowNull: false }
    });
    return Message;
};
