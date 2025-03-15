const {User, Notification} = require ('../models')
const nodemailer = require('nodemailer')
require('dotenv').config()
const sendPasswordNotification = async(userEmail, resetCode)=>{
    try{
        const user = await User.findOne({where: {email: userEmail}})
        if (!user)
        {
            throw new Error('User not found')
        }
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
            to : userEmail,
            subject : 'Password Reset Code',
            from : 'Team Sportify',
            html: `Your password reset code is ${resetCode}`
        })
    }catch(error)
    {
        console.error('Error sending reset password Notification', error)
    }
}
module.exports = sendPasswordNotification