"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chat.belongsTo(models.User,{
        foreignKey: 'senderId',
        targetKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      Chat.belongsTo(models.User,{
        foreignKey: 'receiverId',
        targetKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })

      Chat.hasMany(models.Message,{
        foreignKey: 'chatId',
        targetKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "uuid",
        },
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model : "users",
          key : "uuid"
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "Chats",
      timestamps: true,
    }
  );
  return Chat;
};
