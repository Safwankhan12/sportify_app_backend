"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.User,{
        foreignKey : 'userEmail',
        targetKey : 'email',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
    }
  }
  Booking.init(
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
      userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references : {
          model : "users",
          key : "email"
        }
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sportType: {
        type: DataTypes.ENUM("Football", "Cricket","Badminton"),
        allowNull: false,
        defaultValue : 'Football'
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      bookingDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      bookingTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      groundName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      visibility : {
        type : DataTypes.ENUM('public','private'),
        defaultValue : 'public',
        allowNull : false,
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
      modelName: "Booking",
      tableName: "bookings",
      timestamps: true,
    }
  );
  return Booking;
};
