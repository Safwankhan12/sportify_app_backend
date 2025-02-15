"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User,{
        foreignKey : 'senderId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      }),

      Message.belongsTo(models.Chat,{
        foreignKey : 'chatId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      }),
      Message.belongsTo(models.Group,{
        foreignKey : 'groupId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
    }
  }
  Message.init(
    {
      id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
      },
      chatId: {
        type: DataTypes.UUID,
        allowNull: true,
        references : {
          model : 'chats',
          key : 'uuid'
        }
      },
      groupId: {
        type: DataTypes.UUID,
        allowNull: true,
        references : {
          model : 'groups',
          key : 'uuid'
        }
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model : 'users',
          key : 'uuid'
        }
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "Message",
      tableName: "messages",
      timestamps: true,
    }
  );
  return Message;
};
