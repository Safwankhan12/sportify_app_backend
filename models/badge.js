"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Badge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Badge.hasMany(models.UserBadge, {
        foreignKey: "badgeId",
        sourceKey: "uuid",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Badge.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "beginner",
          "engaged",
          "hyperActive",
          "gameCreator",
          "firstVictory",
          "champion",
          "legend"
        ),
        allowNull: false,
      },
      icon: {
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
      modelName: "Badge",
      tableName: "badges",
      timestamps: true,
    }
  );
  return Badge;
};
