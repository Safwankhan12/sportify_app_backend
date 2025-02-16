"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bookingDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      bookingTime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      venueName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      venueId : {
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull : true,
      },
      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status : {
        type : Sequelize.ENUM('Pending','Confirmed','Rejected'),
        defaultValue : 'Pending',
        allowNull : false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Bookings");
  },
};
