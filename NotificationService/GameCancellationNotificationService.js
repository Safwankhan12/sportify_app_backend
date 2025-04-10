require("dotenv").config();
const nodemailer = require("nodemailer");
const { User, Notification } = require("../models");

const GameCancellationNotification = async (approvedRequests, game) => {
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
    for (const request of approvedRequests) {
      await Notification.create({
        userId: request.userId,
        type: "GameCancellation",
        title: "Game Cancellation",
        message: `The game '${game.gameName}' you were approved for at time ${game.gameTime} has been cancelled by the Host.`,
      });
      await transporter.sendMail({
        to: request.Requester.email,
        subject: "Game Cancellation",
        from: "Team Sportify",
        html: `
            <div style="text-align: center; font-family: Arial, sans-serif;">
            <p>The game '${game.gameName}' you were approved for at time ${game.gameTime} has been cancelled by the Host.</p>
            <p>- Team Sportify</p>
            </div>
            `,
      });
    }
  } catch (error) {
    console.error("Error sending game cancellation notification:", error);
  }
};
module.exports = GameCancellationNotification;
