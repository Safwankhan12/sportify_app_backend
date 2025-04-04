require("dotenv").config();
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { Booking, User, Venue, Game, GameRequest, GameResult } = require("../models");
const PrivateGameCode = require("../utils/PrivateCode");
const nodemailer = require("nodemailer");
const checkAndAwardBadges = require('../utils/BadgeService')
const PrivateCodeNotification = require('../NotificationService/PrivateCodeNotificationService')
const { Op } = require("sequelize");
router.post(
  "/addnewgame",
  [
    body("gameName")
      .isLength({ min: 3 })
      .withMessage("Game Name should be at least 3 characters"),
    body("fullName")
      .isLength({ min: 3 })
      .withMessage("Full Name should be at least 3 characters"),
    body("userEmail").isEmail().withMessage("Enter a valid Email"),
    body("sportType")
      .isIn(["Football", "Cricket", "Badminton"])
      .withMessage(
        "Sport Type should be either Football, Cricket, or Badminton"
      ),
    body("gameDate").isDate().withMessage("Game Date should be in Date format"),
    body("gameTime").isString().withMessage("Game Time should be a string"),
    body("visibility")
      .isIn(["public", "private"])
      .withMessage("Visibility should be either Public or Private"),
    body("venueName")
      .isLength({ min: 3 })
      .withMessage("Venue Name should be at least 3 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ where: { email: req.body.userEmail } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      let venueId = null;
      if (req.body.venueId) {
        const venue = await Venue.findOne({
          where: { uuid: req.body.venueId },
        });
        if (!venue) {
          return res.status(400).json({ message: "Venue not found" });
        }
        venueId = venue.id; // Assign the found venue's ID
      }
      const formattedGameDate = new Date(req.body.gameDate).toISOString();
      const existingGame = await Game.findOne({
        where: {
          userEmail: req.body.userEmail,
          gameDate: formattedGameDate,
          gameTime: req.body.gameTime,
        },
      });
      if (existingGame && existingGame.gameProgress === 'in_progress') {
        return res
          .status(400)
          .json({ message: "User already has an existing game in progress" });
      }
      const joinCodeGame = PrivateGameCode();
      const newGame = await Game.create({
        gameName: req.body.gameName,
        fullName: req.body.fullName,
        userEmail: req.body.userEmail,
        sportType: req.body.sportType,
        gameDate: req.body.gameDate,
        gameTime: req.body.gameTime,
        visibility: req.body.visibility,
        venueId: venueId, // Will be null if venueId is not provided
        venueName: req.body.venueName,
        joinCode: req.body.visibility === "private" ? joinCodeGame : null,
        hostTeamSize: req.body.hostTeamSize,
        opponentDifficulty: req.body.opponentDifficulty ? req.body.opponentDifficulty : null,
        isOpponent : req.body.isOpponent,
        isTeamPlayer : req.body.isTeamPlayer
      });
      if (req.body.visibility === "private") {
        await PrivateCodeNotification(user.email, joinCodeGame)
      }
      await user.update({
        activityPoints : user.activityPoints + 15
      })

      await checkAndAwardBadges(user.uuid)

      return res
        .status(200)
        .json({ message: "Game created successfully", game: newGame });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post("/verify-game-code", async (req, res) => {
  try {
    const { joinCode, gameId } = req.body;
    const game = await Game.findOne({ where: { uuid: gameId } });
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }
    if (game.visibility === "private" && game.joinCode !== joinCode) {
      return res.status(400).json({ error: "Invalid Join Code" });
    }
    return res.status(200).json({ message: "Join Code Verified" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/joingame", async (req, res) => {
  try {
    const { gameId, userId, role } = req.body;
    const user = await User.findOne({ where: { uuid: userId } });
    if (!user)
    {
      return res.status(400).json({ error: "User not found" });
    }
    const game = await Game.findOne({ where: { uuid: gameId } });
    if (!game)
    {
      return res.status(400).json({ error: "Game not found" });
    }
    const hostEmail = game.userEmail;
    const host = await User.findOne({ where: { email: hostEmail } });
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }
    if (role === "hostTeam") {
      if (game.gameStatus !== "open") {
        return res.status(400).json({ error: "Game is not open for joining" });
      }
      if (game.joinedPlayers >= game.hostTeamSize) {
        return res.status(400).json({ error: "Host Team is full" });
      }
    }
    if (role === "opponentTeam") {
      if (game.opponentTeamId) {
        return res.status(400).json({ error: "Opponent Team already found" });
      }
    }
    const existingRequest = await GameRequest.findOne({
      where: { gameId: gameId, userId: userId },
    });
    // if (existingRequest.status === "approved") {
    //   return res.status(400).json({ error: "Request already approved" });
    // }
    if (existingRequest) {
      return res.status(400).json({ error: "Request already exists" });
    }
    const request = await GameRequest.create({
      gameId: gameId,
      userId: userId,
      role: role,
      hostId: host.uuid,
    });
    return res
      .status(200)
      .json({ message: "Request sent successfully", request: request, UserName : user.firstName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/approverequest/:uuid", async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.uuid;
    const request = await GameRequest.findOne({ where: { uuid: requestId } });
    if (!request) {
      return res.status(400).json({ error: "Request not found" });
    }
    const game = await Game.findOne({ where: { uuid: request.gameId } });
    if (game.gameStatus === "closed") {
      return res.status(400).json({ error: "Game joining is closed" });
    }
    if (request.status === "approved") {
      return res.status(400).json({ error: "Request already approved" });
    }
    if (game.joinedPlayers === game.hostTeamSize) {
      game.gameStatus = "closed";
      await game.save();
      return res.status(400).json({ error: "Players are full" });
    }
    const user = await User.findOne({ where: { uuid: request.userId } });
    const host = await User.findOne({ where: { uuid: request.hostId } });
    if (request.role === "hostTeam") {
      if (status === "approved") {
        game.joinedPlayers += 1;
        await user.update({
          activityPoints : user.activityPoints + 10
        })
        await host.update({
          activityPoints : host.activityPoints + 5
        })
        await game.save();
        await checkAndAwardBadges(user.uuid)
      }
    }
    if (request.role === "opponentTeam") {
      if (status === "approved") {
        game.opponentTeamId = request.userId;
        await user.update({
          activityPoints : user.activityPoints + 10
        })
        await host.update({
          activityPoints : host.activityPoints + 5
        })
        await game.save();
        await checkAndAwardBadges(user.uuid)
      }
    }
    await request.update({ status });
    return res.status(200).json({
      message: `Request ${status} for role ${request.role} successfully`,
      userUUID : user.uuid
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/closejoiningmanually/:uuid", async (req, res) => {
  try {
    const gameId = req.params.uuid;
    const game = await Game.findOne({ where: { uuid: gameId } });
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }
    if (game.joinedPlayers < game.hostTeamSize) {
      return res.status(400).json({
        message: `Warning: Only ${game.joinedPlayers}/${game.hostTeamSize} players have joined`,
      });
    }
    game.gameStatus = "closed";
    await game.save();
    return res.status(200).json({ message: "Game joining has been closed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getallgames", async (req, res) => {
  try {
    const games = await Game.findAll();
    if (!games) {
      return res.status(400).json({ error: "No games found" });
    }
    return res.status(200).json({ Games: games });
  } catch (err) {
    console.error(err);
  }
});

router.get("/getgame/:uuid", async (req, res) => {
  const gameid = req.params.uuid;
  try {
    const game = await Game.findOne({ where: { uuid: gameid } });
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }
    const gameHost = await User.findOne({ where: { email: game.userEmail } });
    if (!gameHost) {
      return res.status(400).json({ error: "Game Host not found" });
    }
    return res.status(200).json({ Game: game, Host : gameHost });
  } catch (err) {
    console.error(err);
  }
});

router.get("/getusergames/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const games = await Game.findAll({ where: { userEmail: userEmail } });
    if (!games) {
      return res.status(400).json({ error: "No games found" });
    }
    return res.status(200).json({ Games: games });
  } catch (err) {
    console.error(err);
  }
});

router.delete("/deletegame/:uuid", async (req, res) => {
  try {
    const gameid = req.params.uuid;

    const game = await Game.findOne({ where: { uuid: gameid } });
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }
    await game.destroy({
      truncate: true,
    });
    return res.status(200).json({ message: "Game deleted successfully" });
  } catch (err) {
    console.error(err);
  }
});

router.get("/getuserrequests/:uuid", async (req, res) => {
  try {
    const userId = req.params.uuid;
    const user = await User.findOne({ where: { uuid: userId } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const requests = await GameRequest.findAll({ 
      where: { hostId: userId } ,
      include : [{
        model : User,
        as : 'Requester',
        attributes : ['firstName', 'lastName']
      }]
    });
    if (!requests) {
      return res.status(400).json({ error: "No requests found" });
    }
    return res.status(200).json({ Requests: requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/getgamerequeststatus/:uuid', async(req,res)=>{
  try{
    const requestId = req.params.uuid
    const request = await GameRequest.findOne({where : {uuid : requestId}})
    if(!request)
    {
      return res.status(400).json({error : "Request not found"})
    }
    return res.status(200).json({status : request.status, UserUUID : request.userId})
  }catch(error)
  {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

router.post('/recordgameresult', async(req,res)=>{
  try{
    const {gameId, userId, score, result} = req.body;
    
    // Find user and game
    const user = await User.findOne({where : {uuid : userId}});
    if(!user) {
      return res.status(400).json({error : "User not found"});
    }
    
    const game = await Game.findOne({where : {uuid : gameId}});
    if(!game) {
      return res.status(400).json({error : "Game not found"});
    }
    
    // Parse the game time range (e.g., "2:15pm-3:15pm", "3:45pm-1:10am")
    const timeRange = game.gameTime.split('-');
    if (timeRange.length !== 2) {
      return res.status(400).json({error: "Invalid game time format"});
    }
    
    // Function to convert time string (like "2:15am", "3:45pm") to minutes since midnight
    const parseTimeToMinutes = (timeStr) => {
      // Clean up the time string and make lowercase for easier parsing
      const cleanTimeStr = timeStr.trim().toLowerCase();
      
      // Determine if it's AM or PM
      const isPM = cleanTimeStr.includes('pm');
      const isAM = cleanTimeStr.includes('am');
      
      if (!isPM && !isAM) {
        return null; // Cannot determine AM/PM
      }
      
      // Remove the am/pm part
      const timeWithoutAMPM = cleanTimeStr.replace(/am|pm/g, '').trim();
      
      // Check if there are minutes
      const hasMinutes = timeWithoutAMPM.includes(':');
      
      let hours, minutes;
      
      if (hasMinutes) {
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
      
      // Return total minutes since midnight
      return hours * 60 + minutes;
    };
    
    const startMinutes = parseTimeToMinutes(timeRange[0]);
    const endMinutes = parseTimeToMinutes(timeRange[1]);
    
    if (startMinutes === null || endMinutes === null) {
      return res.status(400).json({error: "Could not parse game time"});
    }
    
    // Create the game date object
    const gameDate = new Date(game.gameDate);
    
    // Create the game end time
    const gameEndTime = new Date(gameDate);
    const endHours = Math.floor(endMinutes / 60);
    const endMinutesRemainder = endMinutes % 60;
    
    gameEndTime.setHours(endHours, endMinutesRemainder, 0, 0);
    
    // If end time is earlier than start time, it means the game ends the next day
    if (endMinutes < startMinutes) {
      gameEndTime.setDate(gameEndTime.getDate() + 1);
    }
    
    // Current date and time
    const currentDate = new Date();
    
    // Check if the game has finished
    if (currentDate < gameEndTime) {
      return res.status(400).json({
        error: "Game is still in progress or hasn't started yet. Results can only be recorded after the game has finished."
      });
    }
    
    // Check if result already exists
    const existingResult = await GameResult.findOne({
      where: {
        gameId: gameId,
        userId: userId
      }
    });
    
    if (existingResult) {
      return res.status(400).json({error: "Result already recorded for this user and game"});
    }
    
    // Create new game result
    const gameResult = await GameResult.create({
      gameId,
      userId,
      score,
      result
    });
    
    // Update user activity points
    await user.update({
      activityPoints: user.activityPoints + 5
    });
    
    // Check for badges
    await checkAndAwardBadges(user.uuid);
    await game.update({
      gameProgress : 'completed'
    })
    return res.status(200).json({
      message: "Game result recorded successfully",
      gameResult: gameResult
    });
    
  } catch(error) {
    console.error('Error in recording game result', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/getgameplayers/:uuid', async(req,res)=>{
  try{
    const gameid = req.params.uuid
    const game = await Game.findOne({where : {uuid : gameid}});
    if(!game)
    {
      return res.status(400).json({error : "Game not found"});
    }
    const joinedPlayersData = await GameRequest.findAll({
      where : {gameId : gameid, status:'approved', role:'hostTeam'},
      include : [{
        model : User,
        as : 'Requester',
        attributes : ['firstName', 'lastName', 'email', 'uuid', 'phoneNo']
      }]
    });
    const opponentTeamData = await GameRequest.findOne({
      where : {gameId : gameid, role : 'opponentTeam', status : 'approved'},
      include : [{
        model : User,
        as : 'Requester',
        attributes : ['firstName', 'lastName', 'email', 'uuid', 'phoneNo']
      }]
    });
    return res.status(200).json({joinedPlayersData, opponentTeamData});
  }catch(error)
  {
    console.error('Error fetching game players', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})


router.get('/search',async(req,res)=>{
  try{
    const {
      gameName,
      sportType,
      visibility,
      venueName,
      startDate,
      endDate,
      userEmail,
      gameStatus,
      joinedPlayers,
      hostTeamSize,
      opponentDifficulty,
      isOpponent,
      isTeamPlayer,
      limit,
      offset
    } = req.query
    const whereClause = {}
    if (gameName) {
      whereClause.gameName = { [Op.like]: `%${gameName}%` };
    }
    if (sportType) {
      whereClause.sportType = sportType;
    }
    if (visibility) {
      whereClause.visibility = visibility;
    }
    if (venueName) {
      whereClause.venueName = { [Op.like]: `%${venueName}%` };
    }
    if (startDate && endDate) {
      whereClause.gameDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.gameDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.gameDate = { [Op.lte]: new Date(endDate) };
    }
    if (userEmail) {
      whereClause.userEmail = userEmail;
    }
    if (gameStatus) {
      whereClause.gameStatus = gameStatus;
    }

    if (joinedPlayers) {
      whereClause.joinedPlayers = parseInt(joinedPlayers);
    }

    if (hostTeamSize) {
      whereClause.hostTeamSize = parseInt(hostTeamSize);
    }
    if (opponentDifficulty) {
      whereClause.opponentDifficulty = opponentDifficulty;
    }
    if (isOpponent !== undefined) {
      whereClause.isOpponent = isOpponent === 'true';
    }

    if (isTeamPlayer !== undefined) {
      whereClause.isTeamPlayer = isTeamPlayer === 'true';
    }
    const paginationOptions = {};
    if (limit) {
      paginationOptions.limit = parseInt(limit);
    }
    if (offset) {
      paginationOptions.offset = parseInt(offset);
    }
    const games = await Game.findAndCountAll({
      where: whereClause,
      ...paginationOptions,
      order: [['gameDate', 'ASC'], ['gameTime', 'ASC']]
    });
    return res.status(200).json({
      totalCount: games.count,
      games: games.rows,
      currentPage: offset ? Math.floor(parseInt(offset) / parseInt(limit)) + 1 : 1,
      totalPages: limit ? Math.ceil(games.count / parseInt(limit)) : 1
    });
  }catch(error)
  {
    console.error('Error in searching game', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

router.get('/search/available',async(req,res)=>{
  try{
    const { sportType, startDate } = req.query;
    const whereClause = {
      gameStatus: 'open',
      gameProgress: { [Op.ne]: 'completed' }
    };
    if (sportType) {
      whereClause.sportType = sportType;
    }
    const today = startDate ? new Date(startDate) : new Date();
    today.setHours(0, 0, 0, 0);
    whereClause.gameDate = { [Op.gte]: today };
    const availableGames = await Game.findAll({
      where: whereClause,
      order: [['gameDate', 'ASC'], ['gameTime', 'ASC']]
    });
    const gamesWithSpots = availableGames.filter(game => game.joinedPlayers < game.hostTeamSize);
    return res.status(200).json({ 
      games: gamesWithSpots,
      count: gamesWithSpots.length
    });
  }catch(error)
  {
    console.error('Error in fetching available games', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

module.exports = router;
