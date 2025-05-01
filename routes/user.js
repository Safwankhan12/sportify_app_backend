const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const hashPassword = require("../utils/helpers");
const GetActiveLevel = require("../utils/GetActiveLevel");
const { User, UserBio } = require("../models");
const isAdmin = require("../middlewares/authenticateAdminMiddleware");
const passport = require("passport");
const { route } = require("./game");
const {getLeaderboardCache} = require('../cron-jobs/updateLeaderboard')
const admin = require('../FirebaseAdmin/firebase')

router.post(
  "/addnewuser",
  passport.authenticate("jwt", { session: false }),
  [
    body("firstName")
      .isLength({ min: 3 })
      .withMessage("First Name should be atleast 3 characters"),
    body("lastName")
      .isLength({ min: 3 })
      .withMessage("Last Name should be atleast 3 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],
  isAdmin,
  async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      return res.status(404).json({ error: "User already exists" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const password = hashPassword(req.body.password);
    const NewUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: password,
    });
    NewUser.save();
    return res.status(200).json({ message: "User added successfully" });
  }
);

router.get("/getallusers", async (req, res) => {
  const users = await User.findAll();
  if (!users) {
    return res.status(400).json({ error: "No users found" });
  }
  return res.status(200).json(users);
});

router.get("/getuser/:uuid", async (req, res) => {
  const userid = req.params.uuid;
  let user = await User.findOne({ where: { uuid: userid } });
  if (!user) {
    return res.status(400).json({ error: "No user found" });
  }
  const userbio = await UserBio.findOne({ where: { userId: user.uuid } });
  user = { ...user.dataValues, userbio };
  return res.status(200).json(user);
});

router.delete("/deleteuser/:uuid", async (req, res) => {
  const userid = req.params.uuid;
  const user = await User.findOne({ where: { uuid: userid } });
  if (!user) {
    return res.status(400).json({ error: "No user found" });
  }
  await user.destroy({
    truncate: true,
  });
  return res.status(200).json({ message: "User deleted successfully" });
});

router.put(
  "/resetpassword/:uuid",
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],
  async (req, res) => {
    const userid = req.params.uuid;
    const user = await User.findOne({ where: { uuid: userid } });
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const NewPassword = hashPassword(req.body.password);
    await user.update({
      password: NewPassword,
    });
    return res.status(200).json({ message: "Password updated successfully" });
  }
);

router.put("/editprofile/:uuid", async (req, res) => {
  try {
    const userid = req.params.uuid;
    const user = await User.findOne({ where: { uuid: userid } });
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }
    await user.update({
      gender: req.body.gender,
      address: req.body.address,
      profilePicture: req.body.profilePicture,
    });
    await admin.firestore().collection('users').doc(user.uuid).update({
      photoUrl: req.body.profilePicture,
    })
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
  }
});

router.put('/edituserbio/:uuid', async(req,res)=>{
  try{
    const userid = req.params.uuid
    const user = await User.findOne({where: {uuid: userid}})
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }
    const userbio = await UserBio.findOne({where: {userId: user.uuid}})
    if (!userbio)
    {
      await UserBio.create({
        userId : user.uuid,
        description : req.body.description,
        skillLevel: req.body.skillLevel,
        experience: req.body.experience,
      })
      return res.status(200).json({message: "User Bio created successfully"})
    }
    else{
      await userbio.update({
        description : req.body.description,
        skillLevel: req.body.skillLevel,
        experience: req.body.experience,
      })
      return res.status(200).json({message: "User Bio updated successfully"})
    }
  }catch(error)
  {
    console.error(error)
    return res.status(500).json({error: "Internal Server Error"})
  }
})

router.get("/get-active-level/:uuid", async (req, res) => {
  try {
    const userid = req.params.uuid;
    const user = await User.findOne({ where: { uuid: userid } });
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }
    const activelevel = GetActiveLevel(user.activityPoints);
    return res.status(200).json({ActivityLevel : activelevel})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/leaderboard', async(req,res)=>{
  try{
    return res.status(200).json(getLeaderboardCache())
  }catch(error)
  {
    console.error('Error fetching leaderboard', error)
    return res.status(500).json({error: "Internal Server Error"})
  }
})

router.get('/leaderboard/:uuid/rank', async(req,res)=>{
  try{
    const userid = req.params.uuid
    const rankQuery = await User.findAll({
      attributes: ['uuid', 'activityPoints', 'firstName', 'lastName'],
      order: [['activityPoints', 'DESC']]
    })
    const rank = rankQuery.findIndex(user => user.uuid === userid) + 1
    return res.status(200).json({rank})
  }catch(error)
  {
    console.error('Error fetching users leaderboard rank', error)
    return res.status(500).json({error: "Internal Server Error"})
  }
})

router.post('/storefcmtoken', async(req,res)=>{
  try{
    const {userUUID, fcmToken} = req.body
    const user = await User.findOne({where: {uuid: userUUID}})
    if (!user)
    {
      return res.status(400).json({error: "No user found"})
    }
    await user.update({
      fcm_token: fcmToken
    })
    return res.status(200).json({message: "FCM token stored successfully"})
  }catch(error)
  {
    console.error('Error storing FCM token', error)
    return res.status(500).json({error: "Internal Server Error"})
  }
})

// router.get('/profileinfo', passport.authenticate('jwt', { session: false }), (req, res) => {
//     return res.status(200).send({
//       success: true,
//       user: {
//         id: req.user.id,
//         email: req.user.email,
//       },
//     });
//   });
module.exports = router;
