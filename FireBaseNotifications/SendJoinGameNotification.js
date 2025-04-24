const admin = require('../FirebaseAdmin/firebase')

const sendJoinGameNotification = async(HostFcmToken, RequesterName)=>{
    try{
        const message = {
            notification:{
                title : 'Game Joining Request',
                body : `${RequesterName} has requested to join you Game.`
            },
            token : HostFcmToken
        }
        admin.messaging().send(message).then(response => {
            console.log("Successfully sent message:", response)
        })
    }catch(error)
    {
        console.log("Error in sendJoinGameNotification: ", error)
    }
}

module.exports = sendJoinGameNotification