const cron = require("node-cron");
const { User } = require("../models");

let leaderboardCache = [];

const updatedleaderboard = async () => {
  try {
    console.log("Updating leaderboard");
    const users = await User.findAll({
      attributes: ["uuid", "firstName", "lastName", "activityPoints"],
      order: [["activityPoints", "DESC"]],
      limit: 10,
    });
    leaderboardCache = users.map(users=>users.toJSON())
    console.log("Leaderboard updated");
  } catch (error) {
    console.error("Unable to update leaderboard", error);
  }
};

cron.schedule("*/5 * * * *", updatedleaderboard);
updatedleaderboard()

module.exports = { getLeaderboardCache: () => leaderboardCache };
