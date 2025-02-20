const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { Booking, User, Venue, Game, GameRequest } = require("../models");
const PrivateGameCode = require("../utils/PrivateCode");
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
      if (existingGame) {
        return res
          .status(400)
          .json({ message: "User already has an existing game" });
      }
      const joinCodeGame = PrivateGameCode();
      console.log(joinCodeGame);
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
      });

      return res
        .status(200)
        .json({ message: "Game created successfully", game: newGame });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post('/verify-game-code', async(req,res)=>{
  try{
    const {joinCode , gameId} = req.body
    const game = await Game.findOne({where : {uuid : gameId}})
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }
    if (game.visibility === "private" && game.joinCode !== joinCode) {
      return res.status(400).json({ error: "Invalid Join Code" });
    }
    return res.status(200).json({ message: "Join Code Verified" });
  }catch(err)
  {
    console.error(err)
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

router.post("/joingame", async (req, res) => {
  try {
    const { gameId, userId, role } = req.body;

    const game = await Game.findOne({ where: { uuid: gameId } });
    const hostEmail = game.userEmail
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
      hostId : host.uuid
    });
    return res
      .status(200)
      .json({ message: "Request sent successfully", request: request });
  } catch (err) {
    console.error(err);
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
    if (game.gameStatus === 'closed')
    {
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
    if (request.role === "hostTeam") {
      if (status === "approved") {
        game.joinedPlayers += 1;
        await game.save();
      }
    }
    if (request.role === "opponentTeam") {
      if (status === "approved") {
        game.opponentTeamId = request.userId;
        await game.save();
      }
    }
    await request.update({ status });
    return res
      .status(200)
      .json({
        message: `Request ${status} for role ${request.role} successfully`,
      });
  } catch (err) {
    console.error(err);
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
      return res
        .status(400)
        .json({
          message: `Warning: Only ${game.joinedPlayers}/${game.hostTeamSize} players have joined`,
        });
    }
    game.gameStatus = "closed";
    await game.save()
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
    return res.status(200).json({ Game: game });
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

router.get('/getuserrequests/:uuid' , async(req,res)=>{
  try{
    const userId = req.params.uuid
    const user = await User.findOne({where : {uuid : userId}})
    if (!user)
    {
      return res.status(400).json({error : "User not found"})
    }
    const requests = await GameRequest.findAll({where : {hostId : userId}})
    if (!requests)
    {
      return res.status(400).json({error : "No requests found"})
    }
    return res.status(200).json({Requests : requests})
  }catch(error)
  {
    console.error(err)
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

module.exports = router;
