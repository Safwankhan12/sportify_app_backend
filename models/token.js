'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Token.init({
    token : {
      type : DataTypes.STRING,
      allowNull : false
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expiresAt : {
      type : DataTypes.DATE,
      allowNull : false
    },
    deviceInfo : {
      type : DataTypes.STRING,
      allowNull : true
    }
  }, {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens',
  });
  return Token;
};