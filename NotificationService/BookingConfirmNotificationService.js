require('dotenv').config()
const {User, Booking, Notification} = require('../models')
const nodemailer = require('nodemailer')

const sendBookingConfirmNotification = async (userEmail, bookingDate, bookingTime, venueName, VenuePrice, OwnerAccNo, OwnerPhoneNo, status)=>{
    try{
        const user = await User.findOne({where: {email: userEmail}})
        if (!user){
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
        if (status === 'Confirmed')
        {
            await Notification.create({
            userId: user.uuid,
            type: 'Booking',
            title: 'Booking Confirmed',
            message: `Your booking has been confirmed.`
        })
        await transporter.sendMail({
            to : user.email,
            subject : 'Booking Confirmed',
            from : 'Team Sportify',
            html : `
            <div style="text-align: center; font-family: Arial, sans-serif;">
            <h2>🎉 Booking Confirmed! 🎉</h2>
            <p>Your booking has been confirmed for Venue ${venueName} on ${bookingDate} at time ${bookingTime}.</p>
            <p>Your Charges Per Hour are Rs ${VenuePrice}</p>
            <p>Ground Owner Account No : ${OwnerAccNo}</p>
            <p>Ground Owner Phone No : ${OwnerPhoneNo}</p>
            <p>Once the payment is made please send the screenshot of your payment to above mentioned Phone No.</p>
            <p>- Team Sportify</p>
            </div>
            `
        })
    }else{
        await Notification.create({
            userId: user.uuid,
            type: 'Booking',
            title: 'Booking Rejected',
            message: `Your booking has been Rejected.`
        })
        await transporter.sendMail({
            to : user.email,
            subject : 'Booking Rejected',
            from : 'Team Sportify',
            html : `
            <div style="text-align: center; font-family: Arial, sans-serif;">
            <h2>Booking Rejected!</h2>
            <p>Your booking has been Rejected for Venue ${venueName} on ${bookingDate} at time ${bookingTime}.</p>
            <p>- Team Sportify</p>
            </div>
            `
        })
    }
    }catch(error)
    {
        console.error('Error sending booking confirmation Notification', error)
    }
}

module.exports = sendBookingConfirmNotification