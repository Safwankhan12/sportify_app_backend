const cron = require('node-cron')
const {User}  = require('../models')
const checkAndAwardBadges  = require('../utils/BadgeService')


const checkBadgeEligibility = async()=>{
    try{
        const users = await User.findAll()
        for (const user of users)
        {
            await checkAndAwardBadges(user.uuid)
        }
        console.log('Badge eligibility checked for all users')
    }catch(error)
    {
        console.error('Error checking badge eligibility for user', error)
    }
}

cron.schedule('0 0 * * *', ()=>{
    checkBadgeEligibility()
})

module.exports = checkBadgeEligibility