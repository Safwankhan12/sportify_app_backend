'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GameRequest.belongsTo(models.User,{
        foreignKey : 'userId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE',
      })

      GameRequest.belongsTo(models.User,{
        foreignKey : 'hostId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE',
      })
      GameRequest.belongsTo(models.Game,{
        foreignKey : 'gameId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE',
      })
    }
  }
  GameRequest.init({
    id : {
      type : DataTypes.INTEGER,
      autoIncrement : true,
      primaryKey : true,
    },
    uuid : {
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV4,
      allowNull : false,
      unique : true,
    },
    gameId : {
      type : DataTypes.UUID,
      allowNull : false,
      references : {
        model : 'games',
        key : 'uuid',
      }
    },
    userId : {
      type : DataTypes.UUID,
      allowNull : false,
      references : {
        model : 'users',
        key : 'uuid',
      }
    },
    hostId : {
      type : DataTypes.UUID,
      allowNull : false,
      references : {
        model : 'users',
        key : 'uuid',
      }
    },
    role : {
      type : DataTypes.ENUM('hostTeam', 'opponentTeam'),
      allowNull : false,
    },
    status : {
      type : DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull : false,
      defaultValue : 'pending',
    }
  }, {
    sequelize,
    modelName: 'GameRequest',
    tableName : 'gameRequests',
    timestamps : true,
  });
  return GameRequest;
};