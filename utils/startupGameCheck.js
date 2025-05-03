// StartupGameCheck.js
const { checkEndedGames } = require('./GameEndChecker');

/**
 * Runs a one-time check for ended games when the server starts
 */
const runStartupGameCheck = async () => {
  console.log('Running startup check for ended games...');
  try {
    const result = await checkEndedGames();
    console.log('Startup game check completed:', result);
    return result;
  } catch (error) {
    console.error('Error during startup game check:', error);
  }
};

module.exports = runStartupGameCheck;