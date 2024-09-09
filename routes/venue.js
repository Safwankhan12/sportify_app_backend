const express = require('express')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {Venue} = require('../models')


router.post('/addvenue', [
    body('name').isLength({min:3}).withMessage('Name should be atleast 3 characters'),
    body('latitude').isFloat().withMessage('Latitude should be a Floating number'),
    body('longitude').isFloat().withMessage('Longitude should be a Floating number'),
    body('address').isLength({min:3}).withMessage('Address should be atleast 3 characters'),
    body('sports').isObject().withMessage('Sports should be a object'),
    body('availability').isObject().withMessage('Availability should be a object'),
    body('price').isNumeric().withMessage('Price should be a number')
],async(req,res)=>{
    const venue = await Venue.findOne({where : {latitude : req.body.latitude, longitude : req.body.longitude, address : req.body.address, name : req.body.name}})
    if (venue)
    {
        return res.status(400).json({error : "Venue already exists"})
    }
    const errors = validationResult(req)
    if (!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }
    const NewVenue = await Venue.create({
        name: req.body.name,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        sports : req.body.sports,
        availability : req.body.availability,
        price : req.body.price
    })
    NewVenue.save()
    return res.status(200).json({message: 'Venue added successfully'})
})



module.exports = router