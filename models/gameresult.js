"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GameResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GameResult.belongsTo(models.Game,{
        foreignKey : 'gameId',
        targetKey : 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })

      GameResult.belongsTo(models.User,{
        foreignKey : 'userId',
        targetKey : 'uuid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  GameResult.init(
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
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model : 'games',
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
      score: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      result: {
        type: DataTypes.ENUM("win", "loss", "draw"),
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
      modelName: "GameResult",
      tableName: "gameresults",
      timestamps: true,
    }
  );
  return GameResult;
};
