require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {User} = require('../models')
const {Token} = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const hashPassword = require('../utils/helpers')


router.post('/signup',[
    body('firstName').isLength({min:3}).withMessage('First Name should be atleast 3 characters'),
    body('lastName').isLength({min:3}).withMessage('Last Name should be atleast 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password should be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
        body('phoneNo')
        .matches(/^03\d{9}$/)
        .withMessage('Phone number should start with 03 and be exactly 11 digits long'),
    body('confirmPassword').custom((value,{req})=>{
        if (value !== req.body.password)
        {
            throw new Error('Passwords do not match')
        }
        return true
    })
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
        password: password,
        phoneNo : req.body.phoneNo,
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
        const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn: '20d'})
        const expirationDate = new Date(Date.now() + 20*24*60*60*1000)

        //await Token.destroy({where : {userId : user.id}})

       const NewToken =  await Token.create({
            token : token,
            userId : user.id,
            expiresAt : expirationDate,
            deviceInfo : req.headers['user-agent']
        })
        NewToken.save()
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

router.post('/logout', passport.authenticate('jwt', {session : false}),async(req,res)=>{
    try{
        const token = req.headers.authorization.split(' ')[1]

        await Token.destroy({where : {token : token}})

        return res.status(200).json({message : 'Logged out successfully'})
    }catch(err)
    {
        return res.status(500).json({error : 'Internal server error'})
    }
})

router.post('/forgot-password', async(req,res)=>{
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
            to : user.email,
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

router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user || user.resetCode !== code || user.resetCodeExpiration < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        return res.status(200).json({ message: 'Reset code verified successfully' });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/reset-password', [
    body('password')
        .isLength({ min: 8 }).withMessage('Password should be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
], async (req, res) => {
    try {
        const { email, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({
            password: hashedPassword,
            resetCode: null,
            resetCodeExpiration: null
        });

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router