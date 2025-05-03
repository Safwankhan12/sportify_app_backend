// GameEndChecker.js
const { Game } = require('../models');
const { Op } = require('sequelize');
const notifyGameHost = require('../FireBaseNotifications/GameEndNotificationService')

/**
 * Converts game time string (e.g., "2:15pm-3:15pm") to end time in minutes
 */
const parseGameEndTime = (gameTimeStr) => {
  try {
    const timeRange = gameTimeStr.split('-');
    if (timeRange.length !== 2) return null;
    
    const endTimeStr = timeRange[1].trim().toLowerCase();
    const isPM = endTimeStr.includes('pm');
    const isAM = endTimeStr.includes('am');
    
    if (!isPM && !isAM) return null;
    
    const timeWithoutAMPM = endTimeStr.replace(/am|pm/g, '').trim();
    const hasMinutes = timeWithoutAMPM.includes(':');
    
    let hours, minutes;
    
    if (hasMinutes) {
      const timeParts = timeWithoutAMPM.split(':');
      hours = parseInt(timeParts[0]);
      minutes = parseInt(timeParts[1]);
    } else {
      hours = parseInt(timeWithoutAMPM);
      minutes = 0;
    }
    
    // Convert to 24-hour format
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    return { hours, minutes };
  } catch (error) {
    console.error('Error parsing game end time:', error);
    return null;
  }
};

/**
 * Checks if a game has ended based on its date and time
 */
const hasGameEnded = (game) => {
  const gameDate = new Date(game.gameDate);
  const endTime = parseGameEndTime(game.gameTime);
  
  if (!endTime) return false;
  
  const gameEndTime = new Date(gameDate);
  gameEndTime.setHours(endTime.hours, endTime.minutes, 0, 0);
  
  // If end time is earlier than start time, it means the game ends the next day
  const startTime = game.gameTime.split('-')[0].trim().toLowerCase();
  const endTimeStr = game.gameTime.split('-')[1].trim().toLowerCase();
  
  // Extract hours for simple comparison
  const getHours = (timeStr) => {
    const isPM = timeStr.includes('pm');
    let hours = parseInt(timeStr.replace(/[^0-9:]/g, '').split(':')[0]);
    if (isPM && hours < 12) hours += 12;
    if (timeStr.includes('am') && hours === 12) hours = 0;
    return hours;
  };
  
  const startHours = getHours(startTime);
  const endHours = getHours(endTimeStr);
  
  if (endHours < startHours) {
    gameEndTime.setDate(gameEndTime.getDate() + 1);
  }
  
  const now = new Date();
  return now >= gameEndTime;
};

/**
 * Checks for games that have ended but haven't been marked as completed
 * and sends notifications to the host only
 */
const checkEndedGames = async () => {
  try {
    // Get all in-progress games
    const activeGames = await Game.findAll({
      where: {
        gameProgress: {
          [Op.or]: ['in_progress', null]
        },
        endNotificationSent: false,
        // Ensure we only check games that have already started
        [Op.or]: [
          {
            gameDate: {
              [Op.lt]: new Date()
            }
          },
          {
            gameDate: {
              [Op.eq]: new Date().setHours(0,0,0,0)
            }
          }
        ]
      }
    });
    
    console.log(`Checking ${activeGames.length} active games for completion...`);
    
    let endedGamesCount = 0;
    
    for (const game of activeGames) {
      if (hasGameEnded(game)) {
        console.log(`Game ${game.uuid} (${game.gameName}) has ended. Sending notification to host...`);
        await notifyGameHost(game.uuid);
        endedGamesCount++;
      }
    }
    
    console.log(`Found and processed ${endedGamesCount} ended games`);
    return {
      checked: activeGames.length,
      ended: endedGamesCount
    };
  } catch (error) {
    console.error('Error in checkEndedGames:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { checkEndedGames };