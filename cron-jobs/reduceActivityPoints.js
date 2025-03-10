const cron = require('node-cron')
const {Op} = require('sequelize')
const {User, sequelize} = require('../models')
const reduceActivityPoints = async()=>{
    console.log('Running daily activity points reduction')
    try{
        await User.update(
            { activityPoints: sequelize.literal("activityPoints * 0.95") }, // Reduce by 5%
            { where: { activityPoints: { [Op.gt]: 0 } } } // Only if points are greater than 0
        );
        console.log('Activity points reduced successfully')
    }catch(error)
    {
        console.error('Error in reducing activity points',error)
    }
}

cron.schedule('0 0 * * *',()=>{
    reduceActivityPoints()
}) // Run daily at midnight

module.exports = reduceActivityPoints