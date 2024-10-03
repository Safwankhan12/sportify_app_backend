require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {User} = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const hashPassword = require('../utils/helpers')


router.post('/signup',[
    body('firstName').isLength({min:3}).withMessage('First Name should be atleast 3 characters'),
    body('lastName').isLength({min:3}).withMessage('Last Name should be atleast 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password should be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
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
    const password = hashPassword(req.body.password)
     const NewUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: password
    })
    NewUser.save()
    return res.status(200).json({message: 'User added successfully'})
}
)

router.post('/login', async(req,res)=>{
    try{
        const user = await User.findOne({where : {email : req.body.email}})
        if (!user)
        {
            return res.status(404).json({error : 'User not found'})
        }
        if (!bcrypt.compareSync(req.body.password,user.password))
        {
            return res.status(400).json({error : 'Invalid credentials'})
        }
        const payload = {
            email : user.email,
            id : user.id
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn: '1h'})
        return res.status(200).json({success : "Logged in successfully with email " + user.email, token : `Bearer ${token}`, role : user.role})
    }catch(err)
    {
        return res.status(500).json({error : 'Internal server error'})
    }
})

router.get('/status',(req,res)=>{
    console.log(`Inside /api/auth/status endpoint`)
    console.log(req.user)
    console.log(req.session)
    return req.user ? res.send(req.user) : res.sendStatus(401)
})

router.get('/logout', (req,res)=>{
    if (!req.user)
    {
        return res.sendStatus(401)
    }
    req.logout((err)=>{
        if (err)
        {
            return res.sendStatus(400)
        }
        req.session.destroy((err)=>{
            if (err)
            {
                return res.sendStatus(400)
            }
        })
        res.sendStatus(200)
    })
})

router.post('/forgot-password', async(req,res)=>{
    console.log(process.env.EMAIL)
    console.log(process.env.PASSWORD)
    try{
        const user = await User.findOne({where : {email : req.body.email}})
        if (!user)
        {
            return res.status(404).json({error : 'User not found'})
        }
        const resetCode = crypto.randomBytes(4).toString('hex')
        const resetCodeExpiration = Date.now() + 3600000
        await user.update({
            resetCode : resetCode,
            resetCodeExpiration : resetCodeExpiration
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
        const info = transporter.sendMail({
            to : 'safwankhan525@gmail.com',
            subject : 'Password Reset Code',
            from : 'Team_Spotify',
            html : `Your password reset code is ${resetCode}`
        })
        return res.status(200).json({message : 'Reset code sent successfully'})
    }catch(err)
    {
        console.error('Error:', err);
        return res.status(500).json({error : 'Internal server error'})
    }
})

router.post('/verify-reset-code',[
    body('password')
        .isLength({ min: 8 }).withMessage('Password should be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
], async(req,res)=>{
    try{
        const {email, code, password} = req.body
        const user = await User.findOne({where : {email : email}})
        if (!user || user.resetCode !== code || user.resetCodeExpiration < Date.now())
        {
            return res.status(404).json({error : 'Invalid or Expired Code'})
        }
        const errors = validationResult(req)
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors: errors.array()})
        }
        const NewPassword = hashPassword(password)
        await user.update({
            password : NewPassword,
            resetCode : null,
            resetCodeExpiration : null
        })
        return res.status(200).json({message : 'Password updated successfully'})
    }catch(err)
    {
        return res.status(500).json({error : 'Internal server error'})
    }
})
module.exports = router