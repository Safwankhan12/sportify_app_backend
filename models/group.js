"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.belongsTo(models.User,{
        foreignKey: 'createdBy',
        targetKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
      Group.hasMany(models.GroupMember,{
        foreignKey: 'groupId',
        sourceKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })

      Group.hasMany(models.Message,{
        foreignKey: 'groupId',
        sourceKey: 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    }
  }
  Group.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model: 'users',
          key: 'uuid'
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
      modelName: "Group",
      tableName: "groups",
      timestamps: true,
    }
  );
  return Group;
};
