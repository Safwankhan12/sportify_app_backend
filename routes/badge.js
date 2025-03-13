require("dotenv").config();
const express = require("express");
const router = express.Router();
const {Badge, UserBadge,User} = require ('../models')


router.get('/getallbadges', async(req,res)=>{
    try{
        const badges = await Badge.findAll()
        if (!badges)
        {
            return res.status(404).json({message: "No badges found"})
        }
        return res.status(200).json({badges : badges})
    }catch(error)
    {
        console.error(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.get('/getbadge/:uuid', async(req,res)=>{
    try{
        const badgeId = req.params.uuid
        const badge = await Badge.findOne({where: {uuid: badgeId}})
        if (!badge)
        {
            return res.status(404).json({message: "No badge found"})
        }
        return res.status(200).json({badge : badge})
    }catch(error)
    {
        console.error(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.get('/getuserbadges/:uuid', async(req,res)=>{
    try{
        const userId = req.params.uuid
        const user = await User.findOne({where: {uuid: userId}})
        if (!user)
        {
            return res.status(404).json({message: "No user found"})
        }
        const userBadges = await UserBadge.findAll({
            where: {userId: userId},
            include : [{model: Badge}]
        })
        if (!userBadges)
        {
            return res.status(404).json({message: "No badges found"})
        }
        const badges = userBadges.map(ub=>({
            uuid : ub.Badge.uuid,
            name : ub.Badge.name,
            description : ub.Badge.description,
            icon : ub.Badge.icon,
        }))
        return res.status(200).json({badges})
    }catch(error)
    {
        console.error(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})
module.exports = router