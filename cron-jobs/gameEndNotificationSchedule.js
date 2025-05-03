const cron = require('node-cron')
const {checkEndedGames}= require('../utils/GameEndChecker')
const runStartupGameCheck = require('../utils/startupGameCheck')

const setupGameEndScheduler = async () => {
    await runStartupGameCheck()
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('Running scheduled check for ended games at', new Date().toISOString());
      await checkEndedGames();
    });
    console.log('Game and Scheduler has been setup to run every 5 minutes');
}

module.exports = setupGameEndScheduler