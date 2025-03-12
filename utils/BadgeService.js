const { where } = require("sequelize");
const { User, Badge, UserBadge, Game, GameRequest, GameResult } = require("../models");

const BADGE_REQUIREMENTS = {
  beginner: { loginCount: 3 },
  engaged: { gamesJoined: 5 },
  hyperActive: { activityPoints: 301 },
  gameCreator: { gamesCreated: 5 },
  firstVictory: { wins: 1 },
  champion: { wins: 10 },
  legend: { activityPoints: 5000 },
};

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findOne({ where: { uuid: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    const badges = await Badge.findAll();
    const userBadges = await UserBadge.findAll({
      where: { userId: user.uuid },
      include: [{ model: Badge }],
    });

    const existingBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    for (const badge of badges) {
      if (existingBadgeIds.has(badge.uuid)) continue;
      const isEligible = await checkBadgeEligibility(user, badge.type);
      if (isEligible) {
        await UserBadge.create({
          userId: user.uuid,
          badgeId: badge.uuid,
        });
        console.log(
          `Badge ${badge.name} awarded to user ${user.firstName} with email ${user.email}`
        );
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking badges", error);
  }
};

const checkBadgeEligibility = async (user, badgeType) => {
  const requirements = BADGE_REQUIREMENTS[badgeType];
  if (!requirements) {
    return false;
  }
  const userStats = await getUserStats(user.uuid);
  switch (badgeType) {
    case "beginner":
      return userStats.loginCount >= requirements.loginCount;

    case "engaged":
      return userStats.gamesJoined >= requirements.gamesJoined;

    case "hyperActive":
      return user.activityPoints >= requirements.activityPoints;

    case "gameCreator":
      return userStats.gamesCreated >= requirements.gamesCreated;

    case "firstVictory":
      return userStats.wins >= requirements.wins;

    case "champion":
      return userStats.wins >= requirements.wins;

    case "legend":
      return user.activityPoints >= requirements.activityPoints;

    default:
      return false;
  }
};

const getUserStats = async(userUUID)=>{
    const user = await User.findOne({where:{uuid:userUUID}});
    if(!user){
        throw new Error("User not found");
    }
    const loginCount = user.loginCount;
    const gamesCreated = await Game.count({where:{userEmail:user.email}});
    const gamesJoined = await GameRequest.count({where:{userId:user.uuid, status:"approved"}});
    const wins = await GameResult.count({where:{userId:user.uuid, result:"win"}});
    return {loginCount, gamesCreated, gamesJoined, wins};
}

module.exports =  checkAndAwardBadges ;
