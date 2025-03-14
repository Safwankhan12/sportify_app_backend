const {User, Notification} = require ('../models')
const nodemailer = require('nodemailer')
require('dotenv').config()
const sendBadgeNotification = async (userId, badgeName)=>{
    try{
        const user = await User.findOne({where: {uuid: userId}})
        if (!user){
            throw new Error('User not found')
        }
        await Notification.create({
            userId:user.uuid,
            type : 'Badge',
            title: 'New Badge Earned',
            message: `Congratulations! You have earned the ${badgeName} badge!`,
        })
        const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port : 465,
            secure : true,
            auth : {
                user : process.env.EMAIL,
                pass : process.env.PASSWORD
            }
        })
        await transporter.sendMail({
            to : user.email,
            subject : 'New Badge Earned',
            from : 'Team Sportify',
            html : `
            <div style="text-align: center; font-family: Arial, sans-serif;">
            <h2>🏆 Congratulations! 🏆</h2>
            <p>You've earned the "${badgeName}" badge in Sportify App.</p>
            <p>Keep up the great work!</p>
            <p>- Team Spotify</p>
            </div>
            `
        })
    }catch(error)
    {
        console.error('Error sending badge Notification', error)
    }
}

module.exports = sendBadgeNotification