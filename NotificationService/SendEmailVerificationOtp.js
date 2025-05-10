require("dotenv").config();
const nodemailer = require("nodemailer");

const EmailVerification = async (userEmail, otp) => {
  try {
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
      to: userEmail,
      subject: "Email Verification Code",
      from: "Team Sportify",
      html: `Your Email Verification code is ${otp}`,
    });
  } catch (error) {
    console.error("Error sending email verification OTP", error);
  }
};
module.exports = EmailVerification;