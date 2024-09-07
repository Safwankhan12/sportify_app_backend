const express = require('express')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {User} = require('../models')
const passport = require('passport')

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