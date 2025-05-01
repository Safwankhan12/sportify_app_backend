require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { User, UserBio } = require("../models");
const { Token } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
//const twilio = require('twilio')
const hashPassword = require("../utils/helpers");
const checkAndAwardBadges = require("../utils/BadgeService");
const sendPasswordNotification = require('../NotificationService/ForgotPasswordNotificationService')
const admin = require('../FirebaseAdmin/firebase')
// const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
// const TWILIO_PHONE = process.env.TWILIO_PHONE

router.post(
  "/signup",
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
    body("phoneNo")
      .matches(/^03\d{9}$/)
      .withMessage(
        "Phone number should start with 03 and be exactly 11 digits long"
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const userEmail = await User.findOne({ where: { email: req.body.email } });
    const userPhone = await User.findOne({
      where: { phoneNo: req.body.phoneNo },
    });
    const userName = await User.findOne({where : {userName : req.body.userName}})
    if (userEmail) {
      return res.status(404).json({ error: "User already exists with this email" });
    }
    if (userPhone)
    {
      return res.status(404).json({ error: "User already exists with this phone number" });
    }
    if (userName)
    {
      return res.status(404).json({ error: "User already exists with this username" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const otp = crypto.randomInt(1000,9999)
    //const opteexpiration = Date.now() + 5 *60 *1000
    const password = hashPassword(req.body.password);
    const NewUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: password,
      phoneNo: req.body.phoneNo,
      //resetCoded : otp,
      //resetCodeExpiration : opteexpiration,
      isPhoneVerified: false,
    });
    // await client.messages.create({
    //     body : `Your verification code is ${otp}`,
    //     to: `+923136361204`,
    //     from : '+18312760404'
    // })
    NewUser.save();
    await admin.firestore().collection('users').doc(NewUser.uuid).set({
      name: req.body.firstName || 'User',
      email: req.body.email || '',
      photoUrl: req.body.photoUrl ? req.body.photoUrl : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
      isOnline: false,
      bio: '',
    }).then(response => {
      console.log('User added to Firestore:', response);
    })
    return res
      .status(200)
      .json({
        message: "User added successfully Otp send to number for verification",
      });
  }
);

// router.post('/verify-otp',async(req,res)=>{
//     try{
//         const {email,otp} = req.body
//         const user = await User.findOne({where : {email : email}})
//         if (!user)
//         {
//             return res.status(404).json({error : 'User not found'})
//         }
//         if (user.resetCode !== otp || user.resetCodeExpiration < Date.now())
//         {
//             return res.status(400).json({error : 'Invalid or expired otp'})
//         }

//         await user.update({
//             isPhoneVerified : true,
//             resetCode : null,
//             resetCodeExpiration : null
//         })
//         return res.status(200).json({message : 'Phone verified successfully'})
//     }catch(err)
//     {
//         console.error(err)
//     }
// })

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (req.body.isAdminLogin && user.role !== "admin") {
      return res.status(400).json({ error: "Admin Access Only" });
    }
    if (!req.body.isAdminLogin && user.role !== "user") {
      return res.status(400).json({ error: "User access only" });
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    await Token.destroy({where : {userId : user.id}})
    await user.update({
      activityPoints: user.activityPoints + 5,
      loginCount: user.loginCount + 1,
    });
    // if (!user.isPhoneVerified)
    // {
    //     return res.status(400).json({error : 'Phone not verified'})
    // }
    const payload = {
      email: user.email,
      id: user.id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "20d",
    });
    const expirationDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);

    

    const NewToken = await Token.create({
      token: token,
      userId: user.id,
      expiresAt: expirationDate,
      deviceInfo: req.headers["user-agent"],
    });
    NewToken.save();
    const userbio = await UserBio.findOne({ where: { userId: user.uuid } });
    await checkAndAwardBadges(user.uuid);
    return res
      .status(200)
      .json({
        success: "Logged in successfully with email " + user.email,
        token: `Bearer ${token}`,
        user: user,
        userbio: userbio,
      });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/status", (req, res) => {
  console.log(`Inside /api/auth/status endpoint`);
  console.log(req.user);
  console.log(req.session);
  return req.user ? res.send(req.user) : res.sendStatus(401);
});

router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];

      await Token.destroy({ where: { token: token } });

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const resetCode = crypto.randomBytes(4).toString("hex");
    const resetCodeExpiration = Date.now() + 3600000;
    await user.update({
      resetCode: resetCode,
      resetCodeExpiration: resetCodeExpiration,
    });

    
    await sendPasswordNotification(user.email, resetCode)
    return res.status(200).json({ message: "Reset code sent successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ where: { email } });

    if (
      !user ||
      user.resetCode !== code ||
      user.resetCodeExpiration < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    return res
      .status(200)
      .json({ message: "Reset code verified successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/reset-password",
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
    try {
      const { email, password } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await user.update({
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiration: null,
      });

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/verify-profile", async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.body.userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userbio = await UserBio.findOne({ where: { userId: user.uuid } });
    if (!userbio)
    {
      return res.status(400).json({error : 'Bio not found'})
    }
    if (!userbio.description || !userbio.skillLevel || !userbio.experience || !user.profilePicture || !user.address || !user.gender) {
      return res.status(400).json({ error: "Profile not verified" });
    }
    return res.status(200).json({ message: "Profile verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
