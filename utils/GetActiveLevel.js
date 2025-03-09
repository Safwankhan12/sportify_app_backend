const GetActiveLevel = (ActivityPoints)=>{
    if (ActivityPoints >= 301) return 'On Fire'
    if (ActivityPoints >= 151) return 'Super Active'
    if (ActivityPoints >= 51) return 'Active'
    return 'Warming Up'
}
module.exports = GetActiveLevel