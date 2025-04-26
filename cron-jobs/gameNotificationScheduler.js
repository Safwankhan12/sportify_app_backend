const cron = require('node-cron')
const {Op} = require('sequelize')
const {Game} = require('../models')
const notifyAllGamePlayers = require('../FireBaseNotifications/GameStartNotificationService')

const parseTimeStringToDate = (timeStr, dateObj) => {
    // Clean up the time string and make lowercase for easier parsing
    const cleanTimeStr = timeStr.trim().toLowerCase();
    
    // Determine if it's AM or PM
    const isPM = cleanTimeStr.includes('pm');
    const isAM = cleanTimeStr.includes('am');
    
    // Remove the am/pm part
    const timeWithoutAMPM = cleanTimeStr.replace(/am|pm/g, '').trim();
    
    // Parse hours and minutes
    let hours, minutes;
    
    if (timeWithoutAMPM.includes(':')) {
      // Parse time with minutes (e.g., "2:15")
      const timeParts = timeWithoutAMPM.split(':');
      hours = parseInt(timeParts[0]);
      minutes = parseInt(timeParts[1]);
    } else {
      // Parse time without minutes (e.g., "2")
      hours = parseInt(timeWithoutAMPM);
      minutes = 0;
    }
    
    // Convert to 24-hour format
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    // Create a new Date object with the same date but adjusted time
    const resultDate = new Date(dateObj);
    resultDate.setHours(hours, minutes, 0, 0);
    
    return resultDate;
  };
  
  const checkAndSendNotifications = async () => {
    try {
      console.log('Checking for upcoming games to send notifications...');
      const now = new Date();
      
      // Calculate time range for upcoming games (now to next 35 minutes)
      const thirtyFiveMinutesLater = new Date(now);
      thirtyFiveMinutesLater.setMinutes(thirtyFiveMinutesLater.getMinutes() + 35);
      
      // Get games for today and tomorrow
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      
      // Find all upcoming games that haven't been completed
      const upcomingGames = await Game.findAll({
        where: {
          gameDate: {
            [Op.gte]: today,
            [Op.lt]: dayAfter
          },
          gameProgress: {
            [Op.ne]: 'completed'
          }
        }
      });
      
      console.log(`Found ${upcomingGames.length} upcoming games to check`);
      
      // Check each game to see if notifications should be sent
      for (const game of upcomingGames) {
        // Parse game time (assuming format like "2:15pm-3:15pm")
        const timeRange = game.gameTime.split('-');
        if (timeRange.length !== 2) continue;
        
        const startTimeStr = timeRange[0];
        const gameDate = new Date(game.gameDate);
        
        // Get the start time as a Date object
        const gameStartTime = parseTimeStringToDate(startTimeStr, gameDate);
        
        // Calculate time differences
        const timeDiff = gameStartTime - now; // milliseconds until game starts
        const minutesUntilGame = Math.floor(timeDiff / (1000 * 60));
        
        // Send notifications at specific intervals
        if (minutesUntilGame > 0) {
          // 30-minute notification
          if (minutesUntilGame >= 29 && minutesUntilGame <= 31) {
            console.log(`Sending 30-minute notification for game ${game.uuid}`);
            await notifyAllGamePlayers(game, 30);
          }
          
          // 15-minute notification
          if (minutesUntilGame >= 14 && minutesUntilGame <= 16) {
            console.log(`Sending 15-minute notification for game ${game.uuid}`);
            await notifyAllGamePlayers(game, 15);
          }
          
          // 5-minute notification
          if (minutesUntilGame >= 4 && minutesUntilGame <= 6) {
            console.log(`Sending 5-minute notification for game ${game.uuid}`);
            await notifyAllGamePlayers(game, 5);
          }
        }
      }
    } catch (error) {
      console.error('Error checking and sending game notifications:', error);
    }
  };
  const initGameNotificationScheduler = () => {
    // Run every 1 minute to check for upcoming games
    cron.schedule('* * * * *', checkAndSendNotifications);
    
    console.log('Game notification scheduler initialized with node-cron');
    
    // Run immediately on startup
    checkAndSendNotifications();
  };

  module.exports = {
    initGameNotificationScheduler,
    checkAndSendNotifications
  }