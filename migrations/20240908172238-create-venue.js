'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Venues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,  // Automatically generates a UUIDV4
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull : true
      },
      latitude: {
        type: Sequelize.DECIMAL(20,15),
        allowNull : true
      },
      longitude: {
        type: Sequelize.DECIMAL(20,15),
        allowNull : true
      },
      address : {
        type : Sequelize.STRING,
        allowNull : true
      },
      sports:{
        type : Sequelize.JSON,
        allowNull : true
      },
      availability : {
        type : Sequelize.JSON,
        allowNull : true
      },
      price : {
        type : Sequelize.INTEGER,
        allowNull : true
      },
      status : {
        type : Sequelize.ENUM('Available', 'Booked'),
        defaultValue : 'Available',
        allowNull : true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Venues');
  }
};