const express = require('express')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {User} = require('../models')

router.post('/adduser',[
    body('firstName').isLength({min:3}).withMessage('First Name should be atleast 3 characters'),
    body('lastName').isLength({min:3}).withMessage('Last Name should be atleast 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({min:6}).withMessage('Password should be atleast 6 characters')
],
async (req,res)=>{
    const user = await User.findOne({where : {email : req.body.email}})
    if (user)
    {
        return res.status(404).json({error : "User already exists"})
    }
    const errors = validationResult(req)
    if (!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }
     const NewUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    })
    NewUser.save()
    return res.status(200).json({message: 'User added successfully'})
}
)
module.exports = router