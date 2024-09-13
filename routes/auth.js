const express = require('express')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {User} = require('../models')
const passport = require('passport')
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

router.post('/login', passport.authenticate("local"),(req,res)=>{
    res.sendStatus(200)
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
module.exports = router