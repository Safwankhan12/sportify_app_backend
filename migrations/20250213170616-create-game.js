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
      opponentDifficulty : {
        type : Sequelize.ENUM('Beginner', 'Average', 'Strong', 'Pro'),
        allowNull : true
      },
      isOpponent : {
        type : Sequelize.BOOLEAN,
        allowNull : true,
      },
      isTeamPlayer : {
        type : Sequelize.BOOLEAN,
        allowNull : true,
      },
      gameStatus : {
        type : Sequelize.ENUM('open', 'closed', 'opponent_found'),
        allowNull : false,
        defaultValue : 'open'
      },
      gameProgress : {
        type : Sequelize.ENUM('in_progress', 'completed'),
        allowNull : false,
        defaultValue : 'in_progress'
      },
      endNotificationSent : {
        type : Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : false
      },
      latitude : {
        type : Sequelize.DOUBLE,
        allowNull : true
      },
      longitude : {
        type : Sequelize.DOUBLE,
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
    await queryInterface.addIndex('Games', ['userEmail'], {
      name: 'games_user_email_idx'
    });
    
    await queryInterface.addIndex('Games', ['gameDate'], {
      name: 'games_game_date_idx'
    });
    
    await queryInterface.addIndex('Games', ['sportType'], {
      name: 'games_sport_type_idx'
    });
    
    await queryInterface.addIndex('Games', ['gameStatus'], {
      name: 'games_game_status_idx'
    });
    
    await queryInterface.addIndex('Games', ['gameProgress'], {
      name: 'games_game_progress_idx'
    });
    
    // Composite index for game date and time (useful for sorting and range queries)
    await queryInterface.addIndex('Games', ['gameDate', 'gameTime'], {
      name: 'games_date_time_idx'
    });
    
    // Composite index for finding available games efficiently
    await queryInterface.addIndex('Games', ['gameStatus', 'gameProgress', 'gameDate'], {
      name: 'games_available_idx'
    });
    
    // Index for venue searches
    await queryInterface.addIndex('Games', ['venueName'], {
      name: 'games_venue_name_idx'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Games', 'games_user_email_idx');
    await queryInterface.removeIndex('Games', 'games_game_date_idx');
    await queryInterface.removeIndex('Games', 'games_sport_type_idx');
    await queryInterface.removeIndex('Games', 'games_game_status_idx');
    await queryInterface.removeIndex('Games', 'games_game_progress_idx');
    await queryInterface.removeIndex('Games', 'games_date_time_idx');
    await queryInterface.removeIndex('Games', 'games_available_idx');
    await queryInterface.removeIndex('Games', 'games_venue_name_idx');
     await queryInterface.dropTable('Games');
  }
};