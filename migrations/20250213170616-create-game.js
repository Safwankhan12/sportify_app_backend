'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid : {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
      },
      gameName : {
        type: Sequelize.STRING,
        allowNull: false
      },
      fullName : {
        type: Sequelize.STRING,
        allowNull: false
      },
      userEmail : {
        type : Sequelize.STRING,
        allowNull : false,
      },
      venueId : {
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull : true
      },
      sportType : {
        type: Sequelize.ENUM("Football", "Cricket", "Badminton"),
        allowNull: false
      },
      gameDate:{
        type: Sequelize.DATE,
        allowNull: false
      },
      gameTime: {
        type: Sequelize.STRING,
        allowNull: false
      },
      visibility : {
        type : Sequelize.ENUM("public", "private"),
        allowNull : false,
        defaultValue : "public"
      },
      venueName : {
        type : Sequelize.STRING,
        allowNull : false
      },
      joinCode : {
        type : Sequelize.STRING,
        allowNull : true
      },
      hostTeamSize:{
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      joinedPlayers : {
        type : Sequelize.INTEGER,
        allowNull : true,
      },
      opponentTeamId : {
        type : Sequelize.UUID,
        allowNull : true
      },
      gameStatus : {
        type : Sequelize.ENUM('open', 'closed', 'opponent_found'),
        allowNull : false,
        defaultValue : 'open'
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
    await queryInterface.dropTable('Games');
  }
};