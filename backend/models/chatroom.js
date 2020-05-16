'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define(
    'ChatRoom',
    {
      name: DataTypes.STRING,
      limit: DataTypes.INTEGER,
    },
    {}
  );
  ChatRoom.associate = function (models) {
    // associations can be defined here
    ChatRoom.hasMany(models.ChatMessage, {
      foreignKey: 'chatRoomId',
      sourceKey: 'id',
    });
  };
  return ChatRoom;
};
