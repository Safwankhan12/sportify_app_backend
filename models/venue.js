"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Venue.hasMany(models.Booking,{
        foreignKey : 'venueId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })

      Venue.hasMany(models.Game,{
        foreignKey: 'venueId',
        sourceKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
      Venue.belongsTo(models.User,{
        foreignKey : 'ownerId',
        targetKey : 'uuid',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
      })
    }
  }
  Venue.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Automatically generates a UUIDV4
        allowNull: false,
        unique: true,
      },
      ownerId : {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
          model : 'users',
          key : 'uuid'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(20, 15),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(20, 15),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sports: {
        type: DataTypes.JSON, // JSON to store array of strings or objects
        allowNull: true,
      },
      availability: {
        type: DataTypes.JSON, // JSON for complex structure (array of objects)
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status : {
        type:DataTypes.ENUM('Available', 'Booked'),
        defaultValue: 'Available',
        allowNull: true
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
      modelName : 'Venue',
      tableName: "venues", 
      timestamps: true
    }
  );
  return Venue;
};
