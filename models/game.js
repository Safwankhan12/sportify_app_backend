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