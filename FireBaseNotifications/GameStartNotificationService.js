const admin = require('../FirebaseAdmin/firebase')
const {User, GameRequest} = require('../models')

const sendGameStartNotification = async(fcmToken, game, minutesUntilStart)=>{
    try{
        if (!fcmToken)
        {
            console.error('No FCM token provided. Cannot send notification.')
            return
        }
        const timeFrame = minutesUntilStart <= 15 ? `${minutesUntilStart} minutes` : `soon`;
        const message = {
            notification : {
                title : `Game starting ${timeFrame}`,
                body : `Your ${game.sportType} game ${game.gameName} at ${game.venueName} is starting ${timeFrame}.`,
            },
            token : fcmToken
        }
        admin.messaging().send(message).then(response => {
            console.log("Successfully sent message:", response)
        })
        return true
    }catch(error)
    {
        console.error('Error sending game start notification:', error)
        return false
    }
}

const notifyAllGamePlayers = async(game, minutesUntilStart)=>{
    try{
        const hostUser = await User.findOne({where : {email : game.userEmail}})
        if (hostUser && hostUser.fmc_token)
        {
            await sendGameStartNotification(hostUser.fcm_token, game, minutesUntilStart)
        }
        const hostTeamPlayers = await GameRequest.findAll({
            where : {
                gameId : game.uuid,
                status : 'approved',
                role : 'hostTeam'
            },
            include : [{
                model : User,
                as : 'Requester',
                attributes : ['fcm_token']
            }]
        })
        for (const player of hostTeamPlayers){
            if (player.Requester && player.Requester.fcm_token)
            {
                await sendGameStartNotification(player.Requester.fcm_token, game, minutesUntilStart)
            }
        } 
        const opponentPlayer = await GameRequest.findOne({
            where : {
                gameId : game.uuid,
                status : 'approved',
                role : 'opponentTeam'
            },
            include : [{
                model : User,
                as : 'Requester',
                attributes : ['fcm_token']
            }]
        })
        if (opponentPlayer && opponentPlayer.Requester && opponentPlayer.Requester.fcm_token)
        {
            await sendGameStartNotification(opponentPlayer.Requester.fcm_token, game, minutesUntilStart)

        }
        return true
    }catch(error)
    {
        console.error('Error notifying all game players:', error)
        return false
    }
}

module.exports = notifyAllGamePlayers