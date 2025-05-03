const admin = require('../FirebaseAdmin/firebase')
const {User, GameRequest, Game} = require('../models')

const sendGameEndNotification = async(hostFcmToken, gameName)=>{
    if (!hostFcmToken)
    {
        console.log('No FCM token provided. Cannot send notification.')
        return
    }
    try{
        const message = {
            notification : {
                title : `Game Ended`,
                body : `Your game ${gameName} has ended. Open the app to record the result`,
            },
            token : hostFcmToken
        }
        admin.messaging().send(message).then(response => {
            console.log("Successfully sent message:", response)
        })
        return true
    }catch(error)
    {
        console.error('Error sending game end notification:', error)
        return false
    }
}

const notifyGameHost = async(gameId)=>{
    try{
        const game = await Game.findOne({where : {uuid : gameId}})
        if (!game)
        {
            console.error('Game not found. Cannot send notification.')
            return false
        }
        if (game.endNotificationSent)
        {
            console.log(`Game end notification already sent for game ${gameId}.`)
            return false
        }
        const hostUser = await User.findOne({where : {email : game.userEmail}})
        if (!hostUser) {
            console.error('Host user not found. Cannot send notification.')
            return false
        }
        if (hostUser.fcm_token)
        {
            await sendGameEndNotification(hostUser.fcm_token, game.gameName)
            await game.update({endNotificationSent : true})
            return true
        }else{
            console.error('Host user does not have a valid FCM token. Cannot send notification.')
            return false
        }
    }catch(error)
    {
        console.error('Error notifying game host:', error)
        return false
    }
}

module.exports = notifyGameHost