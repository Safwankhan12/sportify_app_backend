const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { Booking } = require("../models");
const { route } = require("./auth");

router.post('/addnewbooking',[
    body('userEmail').isEmail().withMessage('Please enter a valid email'),
    body('fullName').isLength({min:3}).withMessage('Full Name should be atleast 3 characters'),
    body('contactNo').isLength({min:11}).withMessage('Contact Number should be atleast 11 digits').matches(/^03[0-9]{2}-?[0-9]{7}$/).withMessage('Contact Number should be of type 03XX-XXXXXXX'),
    body('sportType').isIn(['Football','Cricket','Badminton']).withMessage('Sport Type should be either Football, Cricket or Badminton'),
    body('bookingDate').isDate().withMessage('Booking Date should be in Date format'),
    body('groundName').isLength({min:3}).withMessage('Ground Name should be atleast 3 characters'),
    body('totalAmount').isNumeric().withMessage('Total Amount should be a number'),
    body('visibility').isIn(['Public','Private']).withMessage('Visibility should be either Public or Private')
], async(req,res)=>{
    try{
        const booking = await Booking.findOne({where : {userEmail : req.body.userEmail}})
        if(booking)
        {
            return res.status(400).json({error : 'User already has an existing booking'})
        }
        const errors = validationResult(req)
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors: errors.array()})
        }
        const NewBooking = await Booking.create({
            userEmail : req.body.userEmail,
            fullName : req.body.fullName,
            contactNo : req.body.contactNo,
            sportType : req.body.sportType,
            date : new Date(),
            bookingDate : req.body.bookingDate,
            bookingTime : req.body.bookingTime,
            groundName : req.body.groundName,
            totalAmount : req.body.totalAmount,
            visibility : req.body.visibility
        })
        NewBooking.save();
        return res.status(200).json({message : 'Booking added successfully'})
    }catch(err)
    {
        console.error(err)
    }
})

router.get('/getallbookings', async(req,res)=>{
    try{
        const bookings = await Booking.findAll();
        if (!bookings)
        {
            return res.status(400).json({error : 'No bookings found'})
        }
        return res.status(200).json({Bookings : bookings})
    }catch(err){
        console.error(err)
    }
})

router.get('/getbooking/:uuid',async(req,res)=>{
    try{
        const bookingid = req.params.uuid
        const booking = await Booking.findOne({where : {uuid : bookingid}})
        if (!booking)
        {
            return res.status(400).json({error : 'No booking found'})
        }
        return res.status(200).json({Booking : booking})
    }catch(err)
    {
        console.error(err)
    }
})
module.exports = router;