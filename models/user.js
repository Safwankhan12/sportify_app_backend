'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Booking,{
        foreignKey : 'userEmail',
        sourceKey : 'email',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.Game,{
        foreignKey : 'userEmail',
        sourceKey : 'email',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
      User.hasMany(models.Chat,{
        foreignKey : 'senderId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
      User.hasMany(models.Chat,{
        foreignKey : 'receiverId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.Group,{
        foreignKey : 'createdBy',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.GroupMember,{
        foreignKey : 'userId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.Message,{
        foreignKey : 'senderId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
      User.hasMany(models.Venue,{
        foreignKey : 'ownerId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.GameRequest,{
        foreignKey : 'userId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.UserBadge,{
        foreignKey : 'userId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      User.hasMany(models.GameResult,{
        foreignKey : 'userId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
    }
  }
  User.init({
    uuid : {
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV4,
      allowNull : false,
      unique : true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type : DataTypes.STRING,
      allowNull : false,
      unique : true,
    },
    password: DataTypes.STRING,
    phoneNo : {
      type : DataTypes.STRING,
      allowNull : false,
      unique : true,
    },
    gender : {
      type : DataTypes.ENUM('male', 'female'),
      allowNull : true
    },
    address : {
      type : DataTypes.STRING,
      allowNull : true
    },
    bio : {
      type : DataTypes.STRING,
      allowNull : true
    },
    profilePicture : {
      type : DataTypes.STRING,
      allowNull : true
    },
    activityPoints : {
      type : DataTypes.INTEGER,
      defaultValue : 0
    },
    loginCount : {
      type : DataTypes.INTEGER,
      defaultValue : 0
    },
    resetCode : DataTypes.STRING,
    resetCodeExpiration : DataTypes.DATE,
    isPhoneVerified : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    },
    fcm_token : {
      type : DataTypes.STRING,
      allowNull : true
    },
    role : {
      type : DataTypes.ENUM('admin', 'user'),
      defaultValue : 'user'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  });
  return User;
};