const passport = require('passport')
const {Strategy} = require('passport-local')
const {User} = require('../models')
const { where } = require('sequelize')

passport.serializeUser((user, done)=>{
    console.log("inside serialize user")
    console.log(user)
    done(null, user.email)
})

passport.deserializeUser(async(email, done)=>{
    console.log('inside deserialize user')
    console.log(`deserializing user with id ${email}`)
    try{
    const user = await User.findOne({where : {email : email}})
    if (!user)
    {
        throw new Error('User not found')
    }
    done(null, user)
    }catch(err)
    {
        done(err, null)
    }
})
module.exports = passport.use(
    new Strategy({usernameField:'email'}, async(username, password, done)=>{
        console.log(`Username ${username}`)
        console.log(`Password ${password}`)
        try{
        const user = await User.findOne({where:{email:username}})
        if (!user)
        {
            throw new Error('User not found')
        }
        if (user.password !== password)
        {
            throw new Error('Invalid credentials')
        }
        done(null, user)
        }catch(error) {
            done(error,null)
    }
    })
)