const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { Booking, User, Venue, Game } = require("../models");

router.post('/addnewgame', [
   body('gameName').isLength({ min: 3 }).withMessage('Game Name should be at least 3 characters'),
   body('fullName').isLength({ min: 3 }).withMessage('Full Name should be at least 3 characters'),
   body('userEmail').isEmail().withMessage('Enter a valid Email'),
   body('sportType').isIn(['Football', 'Cricket', 'Badminton']).withMessage('Sport Type should be either Football, Cricket, or Badminton'),
   body('gameDate').isDate().withMessage('Game Date should be in Date format'),
   body('gameTime').isString().withMessage('Game Time should be a string'),
   body('visibility').isIn(['Public', 'Private']).withMessage('Visibility should be either Public or Private')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findOne({ where: { email: req.body.userEmail } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        let venueId = null;
        if (req.body.venueId) {
            const venue = await Venue.findOne({ where: { uuid: req.body.venueId } });
            if (!venue) {
                return res.status(400).json({ message: 'Venue not found' });
            }
            venueId = venue.id; // Assign the found venue's ID
        }

        const existingGame = await Game.findOne({ 
            where: { 
                userEmail: req.body.userEmail, 
                gameDate: req.body.gameDate, 
                gameTime: req.body.gameTime 
            } 
        });
        if (existingGame) {
            return res.status(400).json({ message: 'User already has an existing game' });
        }

        const newGame = await Game.create({
            gameName: req.body.gameName,
            fullName: req.body.fullName,
            userEmail: req.body.userEmail,
            sportType: req.body.sportType,
            gameDate: req.body.gameDate,
            gameTime: req.body.gameTime,
            visibility: req.body.visibility,
            venueId: venueId // Will be null if venueId is not provided
        });

        return res.status(200).json({ message: "Game created successfully", game: newGame });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
