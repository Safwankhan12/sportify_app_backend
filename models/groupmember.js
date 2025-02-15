"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GroupMember.belongsTo(models.User,{
        foreignKey: 'userId',
        targetKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate  : 'CASCADE'
      }),
      GroupMember.belongsTo(models.Group,{
        foreignKey: 'groupId',
        targetKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate  : 'CASCADE'
      })
    }
  }
  GroupMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      groupId: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model : 'groups',
          key : 'uuid'
        }
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model : 'users',
          key : 'uuid'
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
      modelName: "GroupMember",
      tableName: "groupmembers",
      timestamps: true,
    }
  );
  return GroupMember;
};
