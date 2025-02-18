const PrivateGameCode = ()=>{
    const code = Math.random().toString(36).substring(2,8).toUpperCase()
    return code
}

module.exports = PrivateGameCode