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
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type : DataTypes.STRING,
      allowNull : false,
      unique : true,
    },
    password: DataTypes.STRING,
    resetCode : DataTypes.STRING,
    resetCodeExpiration : DataTypes.DATE,
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