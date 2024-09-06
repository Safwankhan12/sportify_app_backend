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
    return req.user ? res.send(req.user) : res.sendStatus(401)
})
module.exports = router