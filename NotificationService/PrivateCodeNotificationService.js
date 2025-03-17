require("dotenv").config();
const nodemailer = require("nodemailer");
const { User } = require("../models");

const PrivateCodeNotification = async (userEmail, PrivateCode) => {
  try {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error("User not found");
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    await transporter.sendMail({
        to:userEmail,
        subject:'Private Game Code',
        from:'Team Sportify',
        html:`Your private game code is ${PrivateCode}`
    })
  } catch (error) {
    console.error("Error sending private code Notification", error);
  }
};

module.exports = PrivateCodeNotification;
