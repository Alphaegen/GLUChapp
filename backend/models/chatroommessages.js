'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define(
    'ChatMessage',
    {
      chatRoomId: DataTypes.INTEGER,
      author: DataTypes.STRING,
      message: DataTypes.TEXT,
    },
    {}
  );
  ChatMessage.associate = function (models) {
    ChatMessage.belongsTo(models.ChatRoom, {
      foreignKey: 'chatRoomId',
      targetKey: 'id',
    });
  };
  return ChatMessage;
};
