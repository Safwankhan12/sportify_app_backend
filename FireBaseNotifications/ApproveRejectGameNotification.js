const admin = require('../FirebaseAdmin/firebase')

const SendApproveRejectGameNotification = async(UserFcmToken, game, status)=>{
    try{
        const message = {
            notification:{
                title : 'Game Approval Status',
                body : `Your request for game ${game.gameName} at time ${game.gameTime} has been ${status} by the host.`
            },
            token : UserFcmToken
        }
        admin.messaging().send(message).then(response => {
            console.log("Successfully sent message:", response)
        })
    }catch(error)
    {
        console.log("Error in SendApproveRejectNotification: ", error)
    }
}

module.exports = SendApproveRejectGameNotification