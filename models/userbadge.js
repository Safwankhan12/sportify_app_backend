"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserBadge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserBadge.belongsTo(models.User,{
        foreignKey : 'userId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE',
      })

      UserBadge.belongsTo(models.Badge,{
        foreignKey : 'badgeId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE',
      })
    }
  }
  UserBadge.init(
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
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "uuid",
        }
      },
      badgeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references : {
          model : 'badges',
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
      modelName: "UserBadge",
      tableName: "userbadges",
      timestamps: true,
    }
  );
  return UserBadge;
};
