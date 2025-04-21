require('dotenv').config()
const {User, Booking, Notification} = require('../models')
const nodemailer = require('nodemailer')

const sendBookingCancellationNotification = async (userEmail, bookingDate, bookingTime, venueName)=>{
    try{
        const user = await User.findOne({where: {email: userEmail}})
        if (!user){
            throw new Error('User not found')
        }
        await Notification.create({
            userId: user.uuid,
            type: 'Booking',
            title: 'Booking Cancelled',
            message: `Your booking has been cancelled.`
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
            subject : 'Booking Cancelled',
            from : 'Team Sportify',
            html : `
            <div style="text-align: center; font-family: Arial, sans-serif;">
            <h2> Booking Cancelled! </h2>
            <p>Your booking has been cancelled for Venue ${venueName} on ${bookingDate} at time ${bookingTime}.</p>
            <p>- Team Sportify</p>
            </div>
            `
        })
    }catch(error)
    {
        console.error('Error sending booking cancellation Notification', error)
    }
}

module.exports = sendBookingCancellationNotification