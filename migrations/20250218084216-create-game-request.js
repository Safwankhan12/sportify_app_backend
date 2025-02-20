'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GameRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid :{
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull : false,
        unique : true,
      },
      gameId : {
        type : Sequelize.UUID,
        allowNull : false,
      },
      userId : {
        type : Sequelize.UUID,
        allowNull : false,
      },
      hostId : {
        type : Sequelize.UUID,
        allowNull : false,
      },
      role : {
        type  : Sequelize.ENUM('hostTeam', 'opponentTeam'),
        allowNull : false
      },
      status : {
        type :  Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull : false,
        defaultValue : 'pending',
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
    await queryInterface.dropTable('GameRequests');
  }
};