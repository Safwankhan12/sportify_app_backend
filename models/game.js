'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Game.belongsTo(models.User, {
        foreignKey : 'userEmail',
        targetKey : 'email',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
      Game.belongsTo(models.Venue,{
        foreignKey: 'venueId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      Game.hasMany(models.GameRequest,{
        foreignKey : 'gameId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      Game.hasOne(models.GameResult,{
        foreignKey : 'gameId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
    }
  }
  Game.init({
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
      gameName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references : {
          model : 'users',
          key : 'email'
        }
      },
      venueId: {
        type: DataTypes.UUID,
        allowNull: true,
        references : {
          model : 'venues',
          key : 'uuid'
        }
      },
      sportType: {
        type: DataTypes.ENUM("Football", "Cricket", "Badminton"),
        allowNull: false,
      },
      gameDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      gameTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM("public", "private"),
        allowNull: false,
        defaultValue: "public",
      },
      venueName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      joinCode : {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hostTeamSize : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      joinedPlayers : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      opponentTeamId : {
        type : DataTypes.UUID,
        allowNull : true,
      },
      opponentDifficulty : {
        type : DataTypes.ENUM('Beginner', 'Average', 'Strong', 'Pro'),
        allowNull : true,
      },
      isOpponent : {
        type : DataTypes.BOOLEAN,
        allowNull : true,
      },
      isTeamPlayer : {
        type : DataTypes.BOOLEAN,
        allowNull : true,
      },
      gameStatus : {
        type: DataTypes.ENUM("open", "closed", "opponent_found"),
        allowNull: false,
        defaultValue: "open",
      },
      gameProgress : {
        type: DataTypes.ENUM("in_progress", "completed"),
        allowNull: false,
        defaultValue: "in_progress",
      },
      endNotificationSent : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      latitude : {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
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
  }, {
    sequelize,
    modelName: 'Game',
    tableName: 'games',
    timestamps: true,
  });
  return Game;
};